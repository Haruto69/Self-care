import { LEVEL_THRESHOLDS } from "../config/levelConfig.js";

const sortedThresholds = [...LEVEL_THRESHOLDS].sort((left, right) => left.threshold - right.threshold);

const normalizeLifetimePoints = (value) => Math.max(0, Number(value) || 0);

export const calculateLevelProgress = (lifetimePointsValue = 0) => {
  const lifetimePoints = normalizeLifetimePoints(lifetimePointsValue);
  const current = sortedThresholds.reduce((matched, candidate) => {
    return lifetimePoints >= candidate.threshold ? candidate : matched;
  }, sortedThresholds[0]);
  const next = sortedThresholds.find((candidate) => candidate.threshold > lifetimePoints) || null;
  const levelSpan = next ? next.threshold - current.threshold : 0;
  const pointsIntoLevel = lifetimePoints - current.threshold;
  const levelProgressPercent = next
    ? Math.min(100, Math.max(0, Math.round((pointsIntoLevel / levelSpan) * 100)))
    : 100;

  return {
    currentLevel: current.level,
    currentLevelName: current.name,
    currentLevelThreshold: current.threshold,
    nextLevel: next?.level || null,
    nextLevelThreshold: next?.threshold || null,
    pointsToNextLevel: next ? Math.max(0, next.threshold - lifetimePoints) : 0,
    levelProgressPercent
  };
};

export const didLevelUp = (previousLifetimePoints, nextLifetimePoints) => {
  return calculateLevelProgress(nextLifetimePoints).currentLevel > calculateLevelProgress(previousLifetimePoints).currentLevel;
};