export const POINT_REASONS = {
  TASK_COMPLETION: "task_completion"
};

export const POINT_VALUES = {
  exercise: {
    daily: 10,
    weekly: 25
  },
  skincare: {
    daily: 8,
    weekly: 20
  },
  focus: {
    daily: 12,
    weekly: 30
  }
};

export const getTaskPointValue = ({ goalType, frequency }) => {
  return POINT_VALUES[goalType]?.[frequency] || 0;
};