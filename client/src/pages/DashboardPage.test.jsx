import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./DashboardPage.jsx";
import { taskService } from "../services/api.js";

vi.mock("../services/api.js", () => ({
  taskService: {
    today: vi.fn(),
    generate: vi.fn(),
    toggle: vi.fn()
  }
}));

const task = {
  _id: "task-1",
  title: "Complete focus sessions",
  description: "Use 25-minute sessions.",
  frequency: "daily",
  completed: false,
  goalId: {
    _id: "goal-1",
    goalType: "focus"
  }
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
  });

  it("shows loading and then an error when tasks cannot load", async () => {
    taskService.today.mockRejectedValueOnce(new Error("Network down"));

    renderDashboard();

    expect(screen.getByText("Loading today's plan")).toBeInTheDocument();
    expect(await screen.findByText("Could not load today's tasks")).toBeInTheDocument();
    expect(screen.queryByText("Loading today's plan")).not.toBeInTheDocument();
  });

  it("shows refresh loading and error states", async () => {
    let rejectGenerate;
    const generatePromise = new Promise((resolve, reject) => {
      rejectGenerate = reject;
    });

    taskService.today.mockResolvedValueOnce([task]);
    taskService.generate.mockReturnValueOnce(generatePromise);

    renderDashboard();

    await screen.findByText("Complete focus sessions");

    const refreshButton = screen.getByRole("button", { name: /refresh tasks/i });
    await userEvent.click(refreshButton);

    expect(screen.getByRole("button", { name: /refreshing/i })).toBeDisabled();

    rejectGenerate(new Error("Refresh failed"));

    expect(await screen.findByText("Could not refresh today's tasks. Please try again.")).toBeInTheDocument();
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
