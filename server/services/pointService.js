import { getTaskPointValue, POINT_REASONS } from "../config/pointsConfig.js";
import PointTransaction from "../models/PointTransaction.js";
import User from "../models/User.js";
import { getDateOnly } from "../utils/dateUtils.js";
import { calculateLevelProgress } from "./levelService.js";

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

const normalizePointProfile = (profile = {}) => {
  const lifetimePoints = Number(profile.lifetimePoints) || 0;

  return {
    totalPoints: Number(profile.totalPoints) || 0,
    lifetimePoints,
    currentLevel: Number(profile.currentLevel) || calculateLevelProgress(lifetimePoints).currentLevel,
    pointsEarnedToday: Number(profile.pointsEarnedToday) || 0,
    lastPointAwardDate: profile.lastPointAwardDate || null
  };
};

const buildSummary = (profile) => {
  const normalized = normalizePointProfile(profile);
  const levelProgress = calculateLevelProgress(normalized.lifetimePoints);

  return {
    ...normalized,
    ...levelProgress
  };
};

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
  const previousLevel = calculateLevelProgress(currentProfile.lifetimePoints);
  const nextLifetimePoints = currentProfile.lifetimePoints + pointsAwarded;
  const nextLevel = calculateLevelProgress(nextLifetimePoints);
  const levelUp = nextLevel.currentLevel > previousLevel.currentLevel
    ? {
        previousLevel: previousLevel.currentLevel,
        currentLevel: nextLevel.currentLevel,
        currentLevelName: nextLevel.currentLevelName
      }
    : null;

  user.pointsProfile = {
    totalPoints: currentProfile.totalPoints + pointsAwarded,
    lifetimePoints: nextLifetimePoints,
    currentLevel: nextLevel.currentLevel,
    pointsEarnedToday: currentTodayPoints + pointsAwarded,
    lastPointAwardDate: today
  };

  await user.save();

  return {
    pointsSummary: buildSummary(user.pointsProfile),
    levelUp
  };
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
      transaction: null,
      levelUp: null
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
      transaction: null,
      levelUp: null
    };
  }

  try {
    const transaction = await PointTransaction.create({
      ...transactionFilter,
      goalId,
      sourceGoal: goalType,
      pointsAwarded
    });
    const { pointsSummary, levelUp } = await addPointsToUser({
      userId,
      pointsAwarded,
      awardedAt: transaction.createdAt
    });

    return {
      pointsAwarded,
      pointsSummary,
      transaction,
      levelUp
    };
  } catch (error) {
    if (error?.code === 11000) {
      return {
        pointsAwarded: 0,
        pointsSummary: await getPointsSummary(userId),
        transaction: null,
        levelUp: null
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