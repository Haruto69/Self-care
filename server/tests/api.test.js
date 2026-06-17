import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import Goal from "../models/Goal.js";
import Task from "../models/Task.js";

process.env.JWT_SECRET = "test_secret_for_api_tests";

let mongoServer;

const focusOptions = {
  focusObjective: "Coding",
  currentFocusHours: 1,
  targetFocusHours: 2,
  mainDistraction: "Phone",
  preferredSessionLength: "25 min",
  studyEnvironment: "Home",
  strictDailyTargets: "Yes"
};

const registerUser = async (email = `user-${Date.now()}@example.com`) => {
  const response = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email,
    password: "test12345"
  });

  return response.body.token;
};

const createFocusGoal = async (token, selectedOptions = focusOptions) => {
  const response = await request(app)
    .post("/api/goals")
    .set("Authorization", `Bearer ${token}`)
    .send({
      goalType: "focus",
      selectedOptions
    });

  return response.body;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Task.syncIndexes();
});

afterEach(async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("auth validation", () => {
  it("rejects weak registration passwords", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Weak User",
      email: "weak@example.com",
      password: "abcdefg"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/letter and one number|at least 8/i);
  });

  it("registers and logs in with valid credentials", async () => {
    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "Valid User",
      email: "valid@example.com",
      password: "abc12345"
    });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.token).toBeTruthy();

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "valid@example.com",
      password: "abc12345"
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.email).toBe("valid@example.com");
  });
});

describe("goal selectedOptions validation", () => {
  it("rejects invalid goal types", async () => {
    const token = await registerUser("bad-goal@example.com");

    const response = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        goalType: "mindfulness",
        selectedOptions: {}
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/goalType/i);
  });

  it("rejects invalid selectedOptions for a goal", async () => {
    const token = await registerUser("bad-options@example.com");

    const response = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({
        goalType: "focus",
        selectedOptions: {
          ...focusOptions,
          preferredSessionLength: "10 min"
        }
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/preferredSessionLength/i);
  });
});

describe("task generation", () => {
  it("is idempotent for the same user, goal, and day", async () => {
    const token = await registerUser("tasks@example.com");
    await createFocusGoal(token);

    const first = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });
    const second = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body.tasks).toHaveLength(5);
    expect(second.body.tasks).toHaveLength(5);
    expect(second.body.createdCount).toBe(0);
  });

  it("cleans stale generated tasks without deleting manual tasks", async () => {
    const token = await registerUser("stale@example.com");
    const goal = await createFocusGoal(token);

    await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });

    await Task.create({
      userId: goal.userId,
      goalId: goal._id,
      title: "Manual note",
      taskKey: "manual-note",
      source: "manual",
      frequency: "daily",
      date: new Date("2026-06-17T00:00:00")
    });

    await request(app)
      .put(`/api/goals/${goal._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        goalType: "focus",
        selectedOptions: {
          ...focusOptions,
          strictDailyTargets: "No"
        },
        isActive: true
      });

    const regenerated = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });

    const titles = regenerated.body.tasks.map((task) => task.title);
    const manualTask = await Task.findOne({ taskKey: "manual-note" });

    expect(regenerated.status).toBe(201);
    expect(titles).not.toContain("Write a strict target list");
    expect(manualTask).toBeTruthy();
  });
});

describe("invalid ids and dates", () => {
  it("returns 400 for invalid ObjectIds", async () => {
    const token = await registerUser("bad-id@example.com");

    const response = await request(app)
      .get("/api/goals/not-a-real-id")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/ObjectId/i);
  });

  it("returns 400 for invalid task dates", async () => {
    const token = await registerUser("bad-date@example.com");

    const response = await request(app)
      .get("/api/tasks/today?date=not-a-date")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/valid date/i);
  });
});
