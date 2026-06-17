import { GOAL_DEFINITIONS } from "../data/goalTemplates.js";

export const getGoalDefinition = (goalType) => {
  return GOAL_DEFINITIONS[goalType] || {
    label: "Personal goal",
    shortLabel: "Goal",
    description: "Daily self-care habits.",
    badge: "Active",
    accent: "default"
  };
};

export const groupTasksByGoal = (tasks) => {
  return tasks.reduce((groups, task) => {
    const goal = task.goalId || {};
    const key = goal._id || task.goalId || "unknown";

    if (!groups[key]) {
      groups[key] = {
        goal,
        goalType: goal.goalType || "unknown",
        tasks: []
      };
    }

    groups[key].tasks.push(task);
    return groups;
  }, {});
};

export const getCompletionRate = (items) => {
  if (!items.length) return 0;
  const completed = items.filter((item) => item.completed).length;
  return Math.round((completed / items.length) * 100);
};
