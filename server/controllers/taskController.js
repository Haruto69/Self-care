import Goal from "../models/Goal.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildTasksForGoal } from "../goalRules/index.js";
import { cleanupDuplicateGeneratedTasks } from "../utils/taskMaintenance.js";
import { validateDateOnly, validateObjectId, validatePositiveDays } from "../utils/validation.js";

const taskPopulate = {
  path: "goalId",
  select: "goalType selectedOptions isActive"
};

const getActiveGoalIds = async (userId) => {
  return Goal.find({ userId, isActive: true }).distinct("_id");
};

const removeStaleGeneratedTasks = async ({ userId, goalId, date, taskKeys }) => {
  const staleKeyFilter = taskKeys.length
    ? {
        $or: [
          { taskKey: { $exists: false } },
          { taskKey: null },
          { taskKey: { $nin: taskKeys } }
        ]
      }
    : {};

  await Task.deleteMany({
    userId,
    goalId,
    date,
    source: { $ne: "manual" },
    ...staleKeyFilter
  });
};

export const getTodayTasks = asyncHandler(async (req, res) => {
  const today = validateDateOnly(req.query.date, "date");
  const activeGoalIds = await getActiveGoalIds(req.user._id);
  const tasks = await Task.find({ userId: req.user._id, date: today, goalId: { $in: activeGoalIds } })
    .populate(taskPopulate)
    .sort({ createdAt: 1 });

  res.json(tasks);
});

export const generateTasks = asyncHandler(async (req, res) => {
  const today = validateDateOnly(req.body.date, "date");
  const goalQuery = { userId: req.user._id, isActive: true };

  if (req.body.goalId) {
    validateObjectId(req.body.goalId, "goal id");
    goalQuery._id = req.body.goalId;
  }

  const goals = await Goal.find(goalQuery);
  const operations = [];

  for (const goal of goals) {
    const generated = buildTasksForGoal(goal, today);
    const generatedTaskKeys = generated.map((task) => task.taskKey);

    await removeStaleGeneratedTasks({
      userId: req.user._id,
      goalId: goal._id,
      date: today,
      taskKeys: generatedTaskKeys
    });

    await cleanupDuplicateGeneratedTasks({
      userId: req.user._id,
      date: today,
      goalIds: [goal._id]
    });

    for (const task of generated) {
      operations.push({
        updateOne: {
          filter: {
            userId: req.user._id,
            goalId: goal._id,
            date: today,
            taskKey: task.taskKey
          },
          update: {
            $set: {
              title: task.title,
              description: task.description,
              frequency: task.frequency,
              source: "generated"
            },
            $setOnInsert: {
              userId: req.user._id,
              goalId: goal._id,
              date: today,
              taskKey: task.taskKey,
              source: "generated",
              completed: false,
              completedAt: null,
              createdAt: new Date()
            }
          },
          upsert: true
        }
      });
    }
  }

  const result = operations.length ? await Task.bulkWrite(operations, { ordered: false }) : null;

  const activeGoalIds = await getActiveGoalIds(req.user._id);
  const tasks = await Task.find({ userId: req.user._id, date: today, goalId: { $in: activeGoalIds } })
    .populate(taskPopulate)
    .sort({ createdAt: 1 });

  res.status(201).json({
    createdCount: result?.upsertedCount || 0,
    tasks
  });
});

export const toggleTask = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, "task id");

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
  const days = validatePositiveDays(req.query.days, 30, 90);
  const end = validateDateOnly(new Date(), "date");
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
