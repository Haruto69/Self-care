import CheckIn from "../models/CheckIn.js";
import Goal from "../models/Goal.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getDateOnly } from "../utils/dateUtils.js";

export const createCheckIn = asyncHandler(async (req, res) => {
  const { goalId, date = new Date(), metrics = {}, notes = "" } = req.body;
  const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });

  if (!goal) {
    res.status(404);
    throw new Error("Goal not found");
  }

  const checkIn = await CheckIn.create({
    userId: req.user._id,
    goalId,
    date: getDateOnly(date),
    metrics,
    notes
  });

  res.status(201).json(checkIn);
});

export const getCheckIns = asyncHandler(async (req, res) => {
  const query = { userId: req.user._id };

  if (req.query.goalId) {
    query.goalId = req.query.goalId;
  }

  const checkIns = await CheckIn.find(query).sort({ date: -1, createdAt: -1 });
  res.json(checkIns);
});

export const getCheckInSummary = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
  const tasks = await Task.find({ userId: req.user._id }).populate("goalId", "goalType");
  const checkIns = await CheckIn.find({ userId: req.user._id }).sort({ date: -1 });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  const byGoal = goals.map((goal) => {
    const goalTasks = tasks.filter((task) => String(task.goalId?._id) === String(goal._id));
    const goalCompleted = goalTasks.filter((task) => task.completed).length;
    const latestCheckIn = checkIns.find((checkIn) => String(checkIn.goalId) === String(goal._id));

    return {
      goalId: goal._id,
      goalType: goal.goalType,
      isActive: goal.isActive,
      selectedOptions: goal.selectedOptions,
      createdAt: goal.createdAt,
      totalTasks: goalTasks.length,
      completedTasks: goalCompleted,
      completionRate: goalTasks.length ? Math.round((goalCompleted / goalTasks.length) * 100) : 0,
      latestCheckIn
    };
  });

  res.json({
    totalGoals: goals.length,
    activeGoals: goals.filter((goal) => goal.isActive).length,
    totalTasks,
    completedTasks,
    completionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
    byGoal
  });
});
