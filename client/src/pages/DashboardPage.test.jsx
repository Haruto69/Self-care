import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage.jsx";
import { pointService, taskService } from "../services/api.js";

vi.mock("../services/api.js", () => ({
  pointService: {
    summary: vi.fn(),
    history: vi.fn()
  },
  taskService: {
    today: vi.fn(),
    generate: vi.fn(),
    toggle: vi.fn()
  }
}));

const pointSummary = {
  totalPoints: 24,
  lifetimePoints: 24,
  currentLevel: 1,
  currentLevelName: "Level 1",
  currentLevelThreshold: 0,
  nextLevel: 2,
  nextLevelThreshold: 100,
  pointsToNextLevel: 76,
  levelProgressPercent: 24,
  pointsEarnedToday: 12,
  lastPointAwardDate: "2026-06-23T00:00:00.000Z"
};

const updatedPointSummary = {
  ...pointSummary,
  totalPoints: 36,
  lifetimePoints: 36,
  pointsEarnedToday: 24,
  pointsToNextLevel: 64,
  levelProgressPercent: 36
};

const nearLevelPointSummary = {
  ...pointSummary,
  totalPoints: 96,
  lifetimePoints: 96,
  pointsEarnedToday: 0,
  pointsToNextLevel: 4,
  levelProgressPercent: 96
};

const levelUpPointSummary = {
  totalPoints: 108,
  lifetimePoints: 108,
  currentLevel: 2,
  currentLevelName: "Level 2",
  currentLevelThreshold: 100,
  nextLevel: 3,
  nextLevelThreshold: 250,
  pointsToNextLevel: 142,
  levelProgressPercent: 5,
  pointsEarnedToday: 12,
  lastPointAwardDate: "2026-06-23T00:00:00.000Z"
};

const task = {
  _id: "task-1",
  taskKey: "focus-sessions",
  title: "Complete focus sessions",
  description: "Use 25-minute sessions.",
  frequency: "daily",
  completed: false,
  goalId: {
    _id: "goal-1",
    goalType: "focus"
  }
};

const completedTask = {
  ...task,
  completed: true,
  completedAt: "2026-06-23T09:00:00.000Z"
};

const refreshedTask = {
  ...task,
  description: "Use 25-minute sessions this Tuesday."
};

const renderDashboard = () => {
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );
};

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pointService.summary.mockResolvedValue(pointSummary);
  });

  it("shows loading and then an error when tasks cannot load", async () => {
    taskService.today.mockRejectedValueOnce(new Error("Network down"));

    renderDashboard();

    expect(screen.getByText("Loading today's plan")).toBeInTheDocument();
    expect(await screen.findByText("Could not load today's tasks")).toBeInTheDocument();
    expect(screen.queryByText("Loading today's plan")).not.toBeInTheDocument();
  });

  it("renders the points card after loading the summary", async () => {
    taskService.today.mockResolvedValueOnce([task]);

    renderDashboard();

    const pointsCard = await screen.findByLabelText("Points summary");

    expect(pointService.summary).toHaveBeenCalledTimes(1);
    expect(within(pointsCard).getByText("Total Points")).toBeInTheDocument();
    expect(within(pointsCard).getByText("Points Earned Today")).toBeInTheDocument();
    expect(within(pointsCard).getByText("Current Level")).toBeInTheDocument();
    expect(within(pointsCard).getByText("Level 1")).toBeInTheDocument();
    expect(within(pointsCard).getByText("76 points to Level 2")).toBeInTheDocument();
    expect(within(pointsCard).getByText("24")).toBeInTheDocument();
    expect(within(pointsCard).getByText("12")).toBeInTheDocument();
  });

  it("renders level progress in the points card", async () => {
    taskService.today.mockResolvedValueOnce([task]);

    renderDashboard();

    const progress = await screen.findByRole("progressbar", { name: /level progress/i });

    expect(progress).toHaveAttribute("aria-valuenow", "24");
  });

  it("shows an error state if points summary fails", async () => {
    pointService.summary.mockRejectedValueOnce(new Error("Points failed"));
    taskService.today.mockResolvedValueOnce([task]);

    renderDashboard();

    const pointsCard = await screen.findByLabelText("Points summary");

    expect(within(pointsCard).getByText("Points unavailable")).toBeInTheDocument();
  });

  it("updates points and keeps the task rendered from wrapped toggle responses", async () => {
    taskService.today.mockResolvedValueOnce([task]);
    taskService.toggle.mockResolvedValueOnce({
      task: completedTask,
      pointsAwarded: 12,
      pointsSummary: updatedPointSummary,
      levelUp: null
    });

    renderDashboard();

    await screen.findByText("Complete focus sessions");
    await userEvent.click(screen.getByRole("button", { name: /mark task complete/i }));

    const pointsCard = await screen.findByLabelText("Points summary");

    expect(await screen.findByText("+12 points earned")).toBeInTheDocument();
    expect(screen.getByText("Complete focus sessions")).toBeInTheDocument();
    expect(screen.getByText("Focus / Studying")).toBeInTheDocument();
    expect(screen.queryByText("Personal goal")).not.toBeInTheDocument();
    expect(within(pointsCard).getByText("36")).toBeInTheDocument();
    expect(within(pointsCard).getByText("24")).toBeInTheDocument();
  });

  it("shows a level-up message after completing a task", async () => {
    pointService.summary.mockResolvedValueOnce(nearLevelPointSummary);
    taskService.today.mockResolvedValueOnce([task]);
    taskService.toggle.mockResolvedValueOnce({
      task: completedTask,
      pointsAwarded: 12,
      pointsSummary: levelUpPointSummary,
      levelUp: {
        previousLevel: 1,
        currentLevel: 2,
        currentLevelName: "Level 2"
      }
    });

    renderDashboard();

    await screen.findByText("Complete focus sessions");
    await userEvent.click(screen.getByRole("button", { name: /mark task complete/i }));

    const pointsCard = await screen.findByLabelText("Points summary");

    expect(await screen.findByText("Level up! You reached Level 2.")).toBeInTheDocument();
    expect(within(pointsCard).getByText("Level 2")).toBeInTheDocument();
    expect(within(pointsCard).getByText("142 points to Level 3")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /level progress/i })).toHaveAttribute("aria-valuenow", "5");
  });

  it("supports legacy plain task toggle responses", async () => {
    taskService.today.mockResolvedValueOnce([task]);
    taskService.toggle.mockResolvedValueOnce(completedTask);

    renderDashboard();

    await screen.findByText("Complete focus sessions");
    await userEvent.click(screen.getByRole("button", { name: /mark task complete/i }));

    expect(screen.getByText("Complete focus sessions")).toBeInTheDocument();
    expect(screen.getByText("Focus / Studying")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark task incomplete/i })).toBeInTheDocument();
    expect(screen.queryByText("Personal goal")).not.toBeInTheDocument();
  });

  it("does not replace a valid task with a malformed toggle response", async () => {
    taskService.today.mockResolvedValueOnce([task]);
    taskService.toggle.mockResolvedValueOnce({
      pointsAwarded: 12,
      pointsSummary: updatedPointSummary
    });

    renderDashboard();

    await screen.findByText("Complete focus sessions");
    await userEvent.click(screen.getByRole("button", { name: /mark task complete/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not update that task. Your change was undone."
    );
    expect(screen.getByText("Complete focus sessions")).toBeInTheDocument();
    expect(screen.getByText("Focus / Studying")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark task complete/i })).toBeInTheDocument();
    expect(screen.queryByText("Personal goal")).not.toBeInTheDocument();
  });

  it("shows refresh loading state", async () => {
    let resolveGenerate;
    const generatePromise = new Promise((resolve) => {
      resolveGenerate = resolve;
    });

    taskService.today.mockResolvedValueOnce([task]);
    taskService.generate.mockReturnValueOnce(generatePromise);

    renderDashboard();

    await screen.findByText("Complete focus sessions");

    await userEvent.click(screen.getByRole("button", { name: /refresh tasks/i }));

    expect(screen.getByRole("button", { name: /refreshing/i })).toBeDisabled();

    resolveGenerate({ tasks: [refreshedTask], changed: true, message: "Tasks refreshed" });

    expect(await screen.findByText("Tasks refreshed")).toBeInTheDocument();
  });

  it("shows a refresh success message", async () => {
    taskService.today.mockResolvedValueOnce([task]);
    taskService.generate.mockResolvedValueOnce({
      tasks: [refreshedTask],
      changed: true,
      message: "Tasks refreshed"
    });

    renderDashboard();

    await screen.findByText("Complete focus sessions");
    await userEvent.click(screen.getByRole("button", { name: /refresh tasks/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("Tasks refreshed");
    expect(screen.getByText("Use 25-minute sessions this Tuesday.")).toBeInTheDocument();
  });

  it("shows an already up to date message when refresh returns no changes", async () => {
    taskService.today.mockResolvedValueOnce([task]);
    taskService.generate.mockResolvedValueOnce({
      tasks: [task],
      changed: false,
      message: "Tasks are already up to date"
    });

    renderDashboard();

    await screen.findByText("Complete focus sessions");
    await userEvent.click(screen.getByRole("button", { name: /refresh tasks/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("Tasks are already up to date");
  });

  it("shows a refresh error state", async () => {
    taskService.today.mockResolvedValueOnce([task]);
    taskService.generate.mockRejectedValueOnce(new Error("Refresh failed"));

    renderDashboard();

    await screen.findByText("Complete focus sessions");
    await userEvent.click(screen.getByRole("button", { name: /refresh tasks/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not refresh today's tasks. Please try again."
    );
    expect(screen.getByRole("button", { name: /refresh tasks/i })).not.toBeDisabled();
  });

  it("optimistically toggles a task and reverts if saving fails", async () => {
    let rejectToggle;
    const togglePromise = new Promise((resolve, reject) => {
      rejectToggle = reject;
    });

    taskService.today.mockResolvedValueOnce([task]);
    taskService.toggle.mockReturnValueOnce(togglePromise);

    renderDashboard();

    await screen.findByText("Complete focus sessions");

    await userEvent.click(screen.getByRole("button", { name: /mark task complete/i }));

    expect(screen.getByRole("button", { name: /mark task incomplete/i })).toBeDisabled();

    rejectToggle(new Error("Save failed"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /mark task complete/i })).not.toBeDisabled();
    });
    expect(screen.getByText("Could not update that task. Your change was undone.")).toBeInTheDocument();
  });
});