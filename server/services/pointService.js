import { getTaskPointValue, POINT_REASONS } from "../config/pointsConfig.js";
import PointTransaction from "../models/PointTransaction.js";
import User from "../models/User.js";
import { getDateOnly } from "../utils/dateUtils.js";

export const DEFAULT_POINTS_PROFILE = {
  totalPoints: 0,
  lifetimePoints: 0,
  currentLevel: 1,
  pointsEarnedToday: 0,
  lastPointAwardDate: null
};

const sameDateOnly = (left, right) => {
  if (!left || !right) return false;
  return getDateOnly(left).getTime() === getDateOnly(right).getTime();
};

const normalizePointProfile = (profile = {}) => ({
  totalPoints: Number(profile.totalPoints) || 0,
  lifetimePoints: Number(profile.lifetimePoints) || 0,
  currentLevel: Number(profile.currentLevel) || 1,
  pointsEarnedToday: Number(profile.pointsEarnedToday) || 0,
  lastPointAwardDate: profile.lastPointAwardDate || null
});

const buildSummary = (profile) => normalizePointProfile(profile);

export const getPointsSummary = async (userId) => {
  const user = await User.findById(userId).select("pointsProfile").lean();
  return buildSummary(user?.pointsProfile);
};

const addPointsToUser = async ({ userId, pointsAwarded, awardedAt = new Date() }) => {
  const user = await User.findById(userId).select("pointsProfile");

  if (!user) {
    throw new Error("User not found for points award");
  }

  const currentProfile = normalizePointProfile(user.pointsProfile);
  const today = getDateOnly(awardedAt);
  const currentTodayPoints = sameDateOnly(currentProfile.lastPointAwardDate, today)
    ? currentProfile.pointsEarnedToday
    : 0;

  user.pointsProfile = {
    totalPoints: currentProfile.totalPoints + pointsAwarded,
    lifetimePoints: currentProfile.lifetimePoints + pointsAwarded,
    currentLevel: currentProfile.currentLevel,
    pointsEarnedToday: currentTodayPoints + pointsAwarded,
    lastPointAwardDate: today
  };

  await user.save();
  return buildSummary(user.pointsProfile);
};

export const awardTaskCompletionPoints = async ({ task, userId }) => {
  const goal = task.goalId;
  const goalType = goal?.goalType;
  const goalId = goal?._id || goal;
  const pointsAwarded = getTaskPointValue({ goalType, frequency: task.frequency });

  if (!goalType || !goalId || !pointsAwarded) {
    return {
      pointsAwarded: 0,
      pointsSummary: await getPointsSummary(userId),
      transaction: null
    };
  }

  const transactionFilter = {
    userId,
    taskId: task._id,
    reason: POINT_REASONS.TASK_COMPLETION
  };
  const existingTransaction = await PointTransaction.findOne(transactionFilter).lean();

  if (existingTransaction) {
    return {
      pointsAwarded: 0,
      pointsSummary: await getPointsSummary(userId),
      transaction: null
    };
  }

  try {
    const transaction = await PointTransaction.create({
      ...transactionFilter,
      goalId,
      sourceGoal: goalType,
      pointsAwarded
    });
    const pointsSummary = await addPointsToUser({ userId, pointsAwarded, awardedAt: transaction.createdAt });

    return {
      pointsAwarded,
      pointsSummary,
      transaction
    };
  } catch (error) {
    if (error?.code === 11000) {
      return {
        pointsAwarded: 0,
        pointsSummary: await getPointsSummary(userId),
        transaction: null
      };
    }

    throw error;
  }
};

export const listPointHistory = async (userId, limit = 50) => {
  return PointTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};