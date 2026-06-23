import Goal from "../models/Goal.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildTasksForGoal } from "../goalRules/index.js";
import { awardTaskCompletionPoints, getPointsSummary } from "../services/pointService.js";
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

  const result = await Task.deleteMany({
    userId,
    goalId,
    date,
    source: { $ne: "manual" },
    ...staleKeyFilter
  });

  return result.deletedCount || 0;
};

const removeGeneratedTasksForInactiveGoals = async ({ userId, date, activeGoalIds }) => {
  const goalFilter = activeGoalIds.length ? { goalId: { $nin: activeGoalIds } } : {};

  const result = await Task.deleteMany({
    userId,
    date,
    source: { $ne: "manual" },
    ...goalFilter
  });

  return result.deletedCount || 0;
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
  let requestedGoalId = null;

  if (req.body.goalId) {
    requestedGoalId = validateObjectId(req.body.goalId, "goal id");
    goalQuery._id = requestedGoalId;
  }

  const [goals, activeGoalIds] = await Promise.all([Goal.find(goalQuery), getActiveGoalIds(req.user._id)]);
  const operationGoalIds = goals.map((goal) => goal._id);
  const operations = [];
  let deletedStaleCount = 0;
  let deletedInactiveCount = 0;
  let deletedDuplicateCount = 0;

  if (!requestedGoalId) {
    deletedInactiveCount = await removeGeneratedTasksForInactiveGoals({
      userId: req.user._id,
      date: today,
      activeGoalIds
    });
  }

  for (const goal of goals) {
    const generated = buildTasksForGoal(goal, today);
    const generatedTaskKeys = generated.map((task) => task.taskKey);

    deletedStaleCount += await removeStaleGeneratedTasks({
      userId: req.user._id,
      goalId: goal._id,
      date: today,
      taskKeys: generatedTaskKeys
    });

    deletedDuplicateCount += await cleanupDuplicateGeneratedTasks({
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
            taskKey: task.taskKey,
            source: { $ne: "manual" }
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

  if (operationGoalIds.length) {
    deletedDuplicateCount += await cleanupDuplicateGeneratedTasks({
      userId: req.user._id,
      date: today,
      goalIds: operationGoalIds
    });
  }

  const tasks = await Task.find({ userId: req.user._id, date: today, goalId: { $in: activeGoalIds } })
    .populate(taskPopulate)
    .sort({ createdAt: 1 });

  const createdCount = result?.upsertedCount || 0;
  const updatedCount = result?.modifiedCount || 0;
  const deletedCount = deletedStaleCount + deletedInactiveCount + deletedDuplicateCount;
  const changed = createdCount + updatedCount + deletedCount > 0;

  res.status(201).json({
    message: changed ? "Tasks refreshed" : "Tasks are already up to date",
    changed,
    createdCount,
    updatedCount,
    deletedCount,
    deletedStaleCount,
    deletedInactiveCount,
    deletedDuplicateCount,
    tasks
  });
});

export const toggleTask = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, "task id");

  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id }).populate(taskPopulate);

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const wasCompleted = task.completed;
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : null;
  await task.save();

  const pointResult = !wasCompleted && task.completed
    ? await awardTaskCompletionPoints({ task, userId: req.user._id })
    : {
        pointsAwarded: 0,
        pointsSummary: await getPointsSummary(req.user._id),
        transaction: null
      };

  res.json({
    task,
    pointsAwarded: pointResult.pointsAwarded,
    pointsSummary: pointResult.pointsSummary
  });
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