import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";
import { calculateLevelProgress } from "../services/levelService.js";
import Goal from "../models/Goal.js";
import Task from "../models/Task.js";
import PointTransaction from "../models/PointTransaction.js";
import User from "../models/User.js";

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

const exerciseOptions = {
  primaryGoal: "Build muscle",
  age: 28,
  gender: "Prefer not to say",
  height: 175,
  currentWeight: 70,
  targetWeight: 75,
  experienceLevel: "Beginner",
  trainingDaysPerWeek: 3,
  timePerWorkout: "45 min",
  gymAccess: "No",
  homeEquipment: ["Dumbbells"],
  averageSleepDuration: 7,
  dailyWaterIntake: 3,
  dietaryPreference: "Vegetarian"
};

const registerUser = async (email = `user-${Date.now()}@example.com`) => {
  const response = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email,
    password: "test12345"
  });

  return response.body.token;
};

const createGoal = async (token, goalType, selectedOptions) => {
  const response = await request(app)
    .post("/api/goals")
    .set("Authorization", `Bearer ${token}`)
    .send({
      goalType,
      selectedOptions
    });

  return response.body;
};

const createFocusGoal = async (token, selectedOptions = focusOptions) => {
  return createGoal(token, "focus", selectedOptions);
};

const createExerciseGoal = async (token, selectedOptions = exerciseOptions) => {
  return createGoal(token, "exercise", selectedOptions);
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await Promise.all([Task.syncIndexes(), PointTransaction.syncIndexes(), User.syncIndexes()]);
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
      email: "VALID@example.com",
      password: "abc12345"
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeTruthy();
    expect(loginResponse.body.user.email).toBe("valid@example.com");
  });

  it("defines and syncs a unique email index", async () => {
    const schemaHasEmailIndex = User.schema
      .indexes()
      .some(([fields, options]) => fields.email === 1 && options.unique === true);
    const databaseHasEmailIndex = (await User.collection.indexes()).some(
      (index) => index.key.email === 1 && index.unique === true
    );

    expect(schemaHasEmailIndex).toBe(true);
    expect(databaseHasEmailIndex).toBe(true);
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
    const goal = await createFocusGoal(token);

    const first = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });
    const second = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });

    const taskKeys = second.body.tasks.map((task) => task.taskKey);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(first.body.tasks).toHaveLength(5);
    expect(second.body.tasks).toHaveLength(5);
    expect(first.body.message).toBe("Tasks refreshed");
    expect(second.body.createdCount).toBe(0);
    expect(second.body.changed).toBe(false);
    expect(second.body.message).toBe("Tasks are already up to date");
    expect(new Set(taskKeys).size).toBe(taskKeys.length);
    expect(await Task.countDocuments({ goalId: goal._id, date: new Date(2026, 5, 17) })).toBe(5);
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
      date: new Date(2026, 5, 17)
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
    const staleTask = await Task.findOne({ taskKey: "focus-strict-targets", source: { $ne: "manual" } });

    expect(regenerated.status).toBe(201);
    expect(regenerated.body.deletedStaleCount).toBeGreaterThan(0);
    expect(titles).not.toContain("Write a strict target list");
    expect(staleTask).toBeNull();
    expect(manualTask).toBeTruthy();
  });

  it("removes generated tasks for inactive goals on refresh", async () => {
    const token = await registerUser("inactive@example.com");
    const goal = await createFocusGoal(token);

    await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });

    await request(app)
      .put(`/api/goals/${goal._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isActive: false });

    const refreshed = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });

    expect(refreshed.status).toBe(201);
    expect(refreshed.body.tasks).toHaveLength(0);
    expect(refreshed.body.deletedInactiveCount).toBeGreaterThan(0);
    expect(await Task.countDocuments({ userId: goal.userId, date: new Date(2026, 5, 17), source: "generated" })).toBe(0);
  });

  it("cleans duplicate generated tasks and preserves completed status", async () => {
    const token = await registerUser("duplicates@example.com");
    const goal = await createFocusGoal(token);
    const date = new Date(2026, 5, 17);

    await Task.collection.insertMany([
      {
        userId: new mongoose.Types.ObjectId(goal.userId),
        goalId: new mongoose.Types.ObjectId(goal._id),
        title: "Old focus sessions",
        taskKey: "focus-sessions",
        description: "Old description",
        frequency: "daily",
        date,
        completed: true,
        completedAt: new Date(2026, 5, 17, 10),
        createdAt: new Date(2026, 5, 17, 8)
      },
      {
        userId: new mongoose.Types.ObjectId(goal.userId),
        goalId: new mongoose.Types.ObjectId(goal._id),
        title: "Duplicate focus sessions",
        taskKey: "focus-sessions",
        description: "Duplicate description",
        frequency: "daily",
        date,
        completed: false,
        completedAt: null,
        createdAt: new Date(2026, 5, 17, 9)
      }
    ]);

    const refreshed = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });

    const focusSessionTasks = await Task.find({
      userId: goal.userId,
      goalId: goal._id,
      date,
      taskKey: "focus-sessions",
      source: { $ne: "manual" }
    });
    const returnedFocusSessions = refreshed.body.tasks.filter((task) => task.taskKey === "focus-sessions");

    expect(refreshed.status).toBe(201);
    expect(refreshed.body.deletedDuplicateCount).toBeGreaterThan(0);
    expect(focusSessionTasks).toHaveLength(1);
    expect(focusSessionTasks[0].completed).toBe(true);
    expect(focusSessionTasks[0].source).toBe("generated");
    expect(returnedFocusSessions).toHaveLength(1);
    expect(returnedFocusSessions[0].completed).toBe(true);
  });

  it("keeps weekly tasks on scheduled days and varies date-based descriptions", async () => {
    const token = await registerUser("weekly@example.com");
    await createExerciseGoal(token);

    const monday = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-22" });
    const tuesday = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-23" });

    const mondayKeys = monday.body.tasks.map((task) => task.taskKey);
    const tuesdayKeys = tuesday.body.tasks.map((task) => task.taskKey);
    const mondayWater = monday.body.tasks.find((task) => task.taskKey === "exercise-water");
    const tuesdayWater = tuesday.body.tasks.find((task) => task.taskKey === "exercise-water");

    expect(monday.status).toBe(201);
    expect(tuesday.status).toBe(201);
    expect(mondayKeys).toContain("exercise-weight-log");
    expect(tuesdayKeys).not.toContain("exercise-weight-log");
    expect(mondayWater.description).toContain("Monday");
    expect(tuesdayWater.description).toContain("Tuesday");
  });
});



describe("level service", () => {
  it("calculates level progress from lifetime points", () => {
    expect(calculateLevelProgress(0)).toMatchObject({
      currentLevel: 1,
      currentLevelThreshold: 0,
      nextLevel: 2,
      nextLevelThreshold: 100,
      pointsToNextLevel: 100,
      levelProgressPercent: 0
    });
    expect(calculateLevelProgress(100)).toMatchObject({
      currentLevel: 2,
      currentLevelThreshold: 100,
      nextLevel: 3,
      pointsToNextLevel: 150,
      levelProgressPercent: 0
    });
    expect(calculateLevelProgress(175)).toMatchObject({
      currentLevel: 2,
      currentLevelThreshold: 100,
      nextLevel: 3,
      nextLevelThreshold: 250,
      pointsToNextLevel: 75,
      levelProgressPercent: 50
    });
    expect(calculateLevelProgress(5000)).toMatchObject({
      currentLevel: 10,
      nextLevel: null,
      nextLevelThreshold: null,
      pointsToNextLevel: 0,
      levelProgressPercent: 100
    });
  });
});
describe("points system", () => {
  it("awards points on first task completion", async () => {
    const token = await registerUser("points-award@example.com");
    const goal = await createFocusGoal(token);

    const generated = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });
    const task = generated.body.tasks.find((item) => item.taskKey === "focus-sessions");

    const response = await request(app)
      .put(`/api/tasks/${task._id}/toggle`)
      .set("Authorization", `Bearer ${token}`);

    const transaction = await PointTransaction.findOne({ taskId: task._id });

    expect(response.status).toBe(200);
    expect(response.body.task.completed).toBe(true);
    expect(response.body.pointsAwarded).toBe(12);
    expect(response.body.pointsSummary).toMatchObject({
      totalPoints: 12,
      lifetimePoints: 12,
      currentLevel: 1,
      pointsEarnedToday: 12
    });
    expect(transaction).toBeTruthy();
    expect(String(transaction.userId)).toBe(goal.userId);
    expect(String(transaction.goalId)).toBe(goal._id);
    expect(transaction.sourceGoal).toBe("focus");
    expect(transaction.pointsAwarded).toBe(12);
    expect(transaction.reason).toBe("task_completion");
  });

  it("does not award duplicate points on repeated toggles", async () => {
    const token = await registerUser("points-duplicate@example.com");
    await createFocusGoal(token);

    const generated = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });
    const task = generated.body.tasks.find((item) => item.taskKey === "focus-sessions");

    const first = await request(app)
      .put(`/api/tasks/${task._id}/toggle`)
      .set("Authorization", `Bearer ${token}`);
    const unchecked = await request(app)
      .put(`/api/tasks/${task._id}/toggle`)
      .set("Authorization", `Bearer ${token}`);
    const rechecked = await request(app)
      .put(`/api/tasks/${task._id}/toggle`)
      .set("Authorization", `Bearer ${token}`);

    expect(first.body.pointsAwarded).toBe(12);
    expect(unchecked.body.pointsAwarded).toBe(0);
    expect(rechecked.body.pointsAwarded).toBe(0);
    expect(rechecked.body.pointsSummary.totalPoints).toBe(12);
    expect(rechecked.body.pointsSummary.lifetimePoints).toBe(12);
    expect(await PointTransaction.countDocuments({ taskId: task._id })).toBe(1);
  });

  it("calculates point summary across completed tasks", async () => {
    const token = await registerUser("points-summary@example.com");
    await createFocusGoal(token);
    await createExerciseGoal(token);

    const generated = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-22" });
    const focusTask = generated.body.tasks.find((item) => item.taskKey === "focus-sessions");
    const weeklyExerciseTask = generated.body.tasks.find((item) => item.taskKey === "exercise-weight-log");

    await request(app)
      .put(`/api/tasks/${focusTask._id}/toggle`)
      .set("Authorization", `Bearer ${token}`);
    await request(app)
      .put(`/api/tasks/${weeklyExerciseTask._id}/toggle`)
      .set("Authorization", `Bearer ${token}`);

    const summary = await request(app)
      .get("/api/points/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(summary.status).toBe(200);
    expect(summary.body).toMatchObject({
      totalPoints: 37,
      lifetimePoints: 37,
      currentLevel: 1,
      pointsEarnedToday: 37
    });
  });

  it("returns point transaction history", async () => {
    const token = await registerUser("points-history@example.com");
    await createFocusGoal(token);

    const generated = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });
    const task = generated.body.tasks.find((item) => item.taskKey === "focus-sessions");

    await request(app)
      .put(`/api/tasks/${task._id}/toggle`)
      .set("Authorization", `Bearer ${token}`);

    const history = await request(app)
      .get("/api/points/history")
      .set("Authorization", `Bearer ${token}`);

    expect(history.status).toBe(200);
    expect(history.body).toHaveLength(1);
    expect(history.body[0]).toMatchObject({
      taskId: task._id,
      sourceGoal: "focus",
      pointsAwarded: 12,
      reason: "task_completion"
    });
    expect(history.body[0].createdAt).toBeTruthy();
  });


  it("updates saved currentLevel and reports a level-up after task completion", async () => {
    const token = await registerUser("level-up@example.com");
    await User.updateOne(
      { email: "level-up@example.com" },
      {
        $set: {
          "pointsProfile.totalPoints": 96,
          "pointsProfile.lifetimePoints": 96,
          "pointsProfile.currentLevel": 1,
          "pointsProfile.pointsEarnedToday": 0,
          "pointsProfile.lastPointAwardDate": null
        }
      }
    );
    await createFocusGoal(token);

    const generated = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-06-17" });
    const task = generated.body.tasks.find((item) => item.taskKey === "focus-sessions");

    const response = await request(app)
      .put(`/api/tasks/${task._id}/toggle`)
      .set("Authorization", `Bearer ${token}`);
    const user = await User.findOne({ email: "level-up@example.com" }).lean();

    expect(response.status).toBe(200);
    expect(response.body.pointsAwarded).toBe(12);
    expect(response.body.levelUp).toMatchObject({
      previousLevel: 1,
      currentLevel: 2,
      currentLevelName: "Level 2"
    });
    expect(response.body.pointsSummary).toMatchObject({
      totalPoints: 108,
      lifetimePoints: 108,
      currentLevel: 2,
      currentLevelName: "Level 2",
      currentLevelThreshold: 100,
      nextLevel: 3,
      nextLevelThreshold: 250,
      pointsToNextLevel: 142,
      levelProgressPercent: 5
    });
    expect(user.pointsProfile.currentLevel).toBe(2);
  });

  it("includes level fields in the point summary response", async () => {
    const token = await registerUser("level-summary@example.com");
    await User.updateOne(
      { email: "level-summary@example.com" },
      {
        $set: {
          "pointsProfile.totalPoints": 175,
          "pointsProfile.lifetimePoints": 175,
          "pointsProfile.pointsEarnedToday": 0
        },
        $unset: {
          "pointsProfile.currentLevel": ""
        }
      }
    );

    const summary = await request(app)
      .get("/api/points/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(summary.status).toBe(200);
    expect(summary.body).toMatchObject({
      totalPoints: 175,
      lifetimePoints: 175,
      currentLevel: 2,
      currentLevelName: "Level 2",
      currentLevelThreshold: 100,
      nextLevel: 3,
      nextLevelThreshold: 250,
      pointsToNextLevel: 75,
      levelProgressPercent: 50
    });
  });
  it("defaults existing users with no points profile to zero points", async () => {
    const token = await registerUser("old-user@example.com");
    await User.updateOne({ email: "old-user@example.com" }, { $unset: { pointsProfile: "" } });

    const summary = await request(app)
      .get("/api/points/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(summary.status).toBe(200);
    expect(summary.body).toMatchObject({
      totalPoints: 0,
      lifetimePoints: 0,
      currentLevel: 1,
      currentLevelName: "Level 1",
      currentLevelThreshold: 0,
      nextLevel: 2,
      nextLevelThreshold: 100,
      pointsToNextLevel: 100,
      levelProgressPercent: 0,
      pointsEarnedToday: 0,
      lastPointAwardDate: null
    });
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

  it("rejects impossible date-only values", async () => {
    const token = await registerUser("impossible-date@example.com");

    const response = await request(app)
      .post("/api/tasks/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2026-02-31" });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/valid date/i);
  });
});