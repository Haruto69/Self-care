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

export const isDisplayableTask = (task) => {
  return Boolean(
    task &&
      typeof task === "object" &&
      task._id &&
      typeof task.title === "string" &&
      task.title.trim()
  );
};

export const groupTasksByGoal = (tasks = []) => {
  return tasks.filter(isDisplayableTask).reduce((groups, task) => {
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

export const getCompletionRate = (items = []) => {
  const displayableItems = items.filter(isDisplayableTask);
  if (!displayableItems.length) return 0;
  const completed = displayableItems.filter((item) => item.completed).length;
  return Math.round((completed / displayableItems.length) * 100);
};