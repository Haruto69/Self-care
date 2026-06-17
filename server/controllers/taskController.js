import Goal from "../models/Goal.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getDateOnly } from "../utils/dateUtils.js";
import { buildTasksForGoal } from "../utils/taskGenerator.js";

const taskPopulate = {
  path: "goalId",
  select: "goalType selectedOptions isActive"
};

export const getTodayTasks = asyncHandler(async (req, res) => {
  const today = getDateOnly(req.query.date || new Date());
  const tasks = await Task.find({ userId: req.user._id, date: today })
    .populate(taskPopulate)
    .sort({ createdAt: 1 });

  res.json(tasks);
});

export const generateTasks = asyncHandler(async (req, res) => {
  const today = getDateOnly(req.body.date || new Date());
  const goalQuery = { userId: req.user._id, isActive: true };

  if (req.body.goalId) {
    goalQuery._id = req.body.goalId;
  }

  const goals = await Goal.find(goalQuery);
  const createdTasks = [];

  for (const goal of goals) {
    const generated = buildTasksForGoal(goal, today);

    for (const task of generated) {
      const existingTask = await Task.findOne({
        userId: req.user._id,
        goalId: goal._id,
        date: today,
        title: task.title
      });

      if (!existingTask) {
        createdTasks.push(
          await Task.create({
            ...task,
            userId: req.user._id,
            goalId: goal._id,
            date: today
          })
        );
      }
    }
  }

  const tasks = await Task.find({ userId: req.user._id, date: today })
    .populate(taskPopulate)
    .sort({ createdAt: 1 });

  res.status(201).json({
    createdCount: createdTasks.length,
    tasks
  });
});

export const toggleTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : null;
  await task.save();

  const populatedTask = await task.populate(taskPopulate);
  res.json(populatedTask);
});

export const getTaskHistory = asyncHandler(async (req, res) => {
  const days = Math.min(Number.parseInt(req.query.days, 10) || 30, 90);
  const end = getDateOnly(new Date());
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  const tasks = await Task.find({
    userId: req.user._id,
    date: { $gte: start, $lte: end }
  })
    .populate(taskPopulate)
    .sort({ date: -1, createdAt: 1 });

  res.json(tasks);
});
