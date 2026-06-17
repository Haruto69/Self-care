import { exerciseRule } from "./exerciseRule.js";
import { focusRule } from "./focusRule.js";
import { skincareRule } from "./skincareRule.js";

export const goalRules = {
  [exerciseRule.id]: exerciseRule,
  [skincareRule.id]: skincareRule,
  [focusRule.id]: focusRule
};

export const GOAL_TYPES = Object.keys(goalRules);

export const getGoalRule = (goalType) => goalRules[goalType] || null;

export const buildTasksForGoal = (goal, date = new Date()) => {
  const rule = getGoalRule(goal.goalType);

  if (!rule) return [];

  return rule.generateTasks(goal.selectedOptions || {}, date);
};
