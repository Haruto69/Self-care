import mongoose from "mongoose";
import { badRequest } from "./httpErrors.js";

export const GOAL_TYPES = ["exercise", "skincare", "focus"];

const yesNo = ["Yes", "No"];

const goalOptionSchemas = {
  exercise: [
    {
      name: "primaryGoal",
      type: "select",
      required: true,
      options: ["Gain weight", "Lose weight", "Build muscle", "Recomposition"]
    },
    { name: "age", type: "number", required: true, min: 10 },
    {
      name: "gender",
      type: "select",
      required: true,
      options: ["Female", "Male", "Non-binary", "Prefer not to say"]
    },
    { name: "height", type: "number", required: true, min: 80 },
    { name: "currentWeight", type: "number", required: true, min: 20 },
    { name: "targetWeight", type: "number", required: true, min: 20 },
    {
      name: "experienceLevel",
      type: "select",
      required: true,
      options: ["Never", "Beginner", "Intermediate", "Advanced"]
    },
    { name: "trainingDaysPerWeek", type: "number", required: true, min: 1, max: 7 },
    {
      name: "timePerWorkout",
      type: "select",
      required: true,
      options: ["30 min", "45 min", "60 min", "90+ min"]
    },
    { name: "gymAccess", type: "select", required: true, options: yesNo },
    {
      name: "homeEquipment",
      type: "multi",
      required: false,
      options: ["Dumbbells", "Resistance bands", "Pull-up bar", "None"]
    },
    { name: "averageSleepDuration", type: "number", required: true, min: 0, max: 14 },
    { name: "dailyWaterIntake", type: "number", required: true, min: 0 },
    {
      name: "dietaryPreference",
      type: "select",
      required: true,
      options: ["Vegetarian", "Non-vegetarian", "Vegan"]
    }
  ],
  skincare: [
    {
      name: "acneSeverity",
      type: "select",
      required: true,
      options: ["Mild", "Moderate", "Severe"]
    },
    { name: "washesFaceDaily", type: "select", required: true, options: yesNo },
    { name: "usesSunscreen", type: "select", required: true, options: yesNo },
    { name: "usesMoisturizer", type: "select", required: true, options: yesNo },
    { name: "averageSleepDuration", type: "number", required: true, min: 0, max: 14 },
    { name: "waterIntakePerDay", type: "number", required: true, min: 0 },
    {
      name: "faceTouchFrequency",
      type: "select",
      required: true,
      options: ["Never", "Sometimes", "Often"]
    },
    {
      name: "pillowcaseFrequency",
      type: "select",
      required: true,
      options: ["Weekly", "Every 2 weeks", "Monthly", "Rarely"]
    }
  ],
  focus: [
    {
      name: "focusObjective",
      type: "select",
      required: true,
      options: ["School", "College", "Competitive exams", "Coding", "Work", "Personal learning"]
    },
    { name: "currentFocusHours", type: "number", required: true, min: 0, max: 16 },
    { name: "targetFocusHours", type: "number", required: true, min: 0.5, max: 16 },
    {
      name: "mainDistraction",
      type: "select",
      required: true,
      options: ["Phone", "Social media", "YouTube", "Gaming", "Daydreaming", "Procrastination"]
    },
    {
      name: "preferredSessionLength",
      type: "select",
      required: true,
      options: ["25 min", "45 min", "60 min", "90 min"]
    },
    {
      name: "studyEnvironment",
      type: "select",
      required: true,
      options: ["Home", "Library", "College", "Cafe"]
    },
    { name: "strictDailyTargets", type: "select", required: true, options: yesNo }
  ]
};

export const validateGoalType = (goalType) => {
  if (!GOAL_TYPES.includes(goalType)) {
    throw badRequest("goalType must be one of: exercise, skincare, focus");
  }

  return goalType;
};

export const validateObjectId = (value, label = "id") => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw badRequest(`${label} must be a valid ObjectId`);
  }

  return value;
};

export const validateDateOnly = (value, label = "date") => {
  const date = value === undefined || value === null ? new Date() : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw badRequest(`${label} must be a valid date`);
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

export const validatePositiveDays = (value, fallback = 30, max = 90) => {
  if (value === undefined) return fallback;

  const days = Number.parseInt(value, 10);

  if (!Number.isInteger(days) || days < 1 || days > max) {
    throw badRequest(`days must be a number between 1 and ${max}`);
  }

  return days;
};

const hasValue = (value) => value !== undefined && value !== null && value !== "";

const validateSelect = (field, value) => {
  if (!field.options.includes(value)) {
    throw badRequest(`${field.name} must be one of: ${field.options.join(", ")}`);
  }

  return value;
};

const validateNumber = (field, value) => {
  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed)) {
    throw badRequest(`${field.name} must be a number`);
  }

  if (field.min !== undefined && parsed < field.min) {
    throw badRequest(`${field.name} must be at least ${field.min}`);
  }

  if (field.max !== undefined && parsed > field.max) {
    throw badRequest(`${field.name} must be at most ${field.max}`);
  }

  return parsed;
};

const validateMulti = (field, value) => {
  const selected = value === undefined ? [] : value;

  if (!Array.isArray(selected)) {
    throw badRequest(`${field.name} must be an array`);
  }

  const invalidOption = selected.find((option) => !field.options.includes(option));

  if (invalidOption) {
    throw badRequest(`${field.name} contains an invalid option: ${invalidOption}`);
  }

  return selected;
};

export const validateSelectedOptions = (goalType, selectedOptions) => {
  validateGoalType(goalType);

  if (!selectedOptions || typeof selectedOptions !== "object" || Array.isArray(selectedOptions)) {
    throw badRequest("selectedOptions must be an object");
  }

  const schema = goalOptionSchemas[goalType];
  const normalized = {};

  for (const field of schema) {
    const value = selectedOptions[field.name];

    if (field.required && !hasValue(value)) {
      throw badRequest(`${field.name} is required`);
    }

    if (!hasValue(value) && field.type !== "multi") continue;

    if (field.type === "select") normalized[field.name] = validateSelect(field, value);
    if (field.type === "number") normalized[field.name] = validateNumber(field, value);
    if (field.type === "multi") normalized[field.name] = validateMulti(field, value);
  }

  return normalized;
};

export const validateOptionalBoolean = (value, label) => {
  if (value === undefined) return undefined;

  if (typeof value !== "boolean") {
    throw badRequest(`${label} must be true or false`);
  }

  return value;
};

export const validatePasswordStrength = (password) => {
  if (typeof password !== "string") {
    throw badRequest("Password is required");
  }

  if (password.length < 8) {
    throw badRequest("Password must be at least 8 characters");
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw badRequest("Password must include at least one letter and one number");
  }
};

export const validateEmail = (email) => {
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw badRequest("Email must be a valid email address");
  }

  return email.trim().toLowerCase();
};
