import Task from "../models/Task.js";

export const syncTaskIndexes = async () => {
  try {
    await Task.syncIndexes();
    console.log("Task indexes synced");
  } catch (error) {
    console.warn("Task index sync warning:", error.message);
  }
};

export const cleanupDuplicateGeneratedTasks = async ({ userId, date, goalIds }) => {
  if (!goalIds.length) return 0;

  const duplicateGroups = await Task.aggregate([
    {
      $match: {
        userId,
        goalId: { $in: goalIds },
        date,
        source: { $ne: "manual" },
        taskKey: { $exists: true, $ne: null }
      }
    },
    {
      $sort: {
        completed: -1,
        completedAt: -1,
        createdAt: 1,
        _id: 1
      }
    },
    {
      $group: {
        _id: {
          goalId: "$goalId",
          taskKey: "$taskKey"
        },
        ids: { $push: "$_id" },
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        count: { $gt: 1 }
      }
    }
  ]);

  const duplicateIds = duplicateGroups.flatMap((group) => group.ids.slice(1));

  if (!duplicateIds.length) return 0;

  const result = await Task.deleteMany({
    _id: { $in: duplicateIds },
    source: { $ne: "manual" }
  });

  return result.deletedCount || 0;
};
