import mongoose from "mongoose";
import { GOAL_TYPES as RULE_GOAL_TYPES, getGoalRule } from "../goalRules/index.js";
import { badRequest } from "./httpErrors.js";

export const GOAL_TYPES = RULE_GOAL_TYPES;

export const validateGoalType = (goalType) => {
  if (!getGoalRule(goalType)) {
    throw badRequest(`goalType must be one of: ${GOAL_TYPES.join(", ")}`);
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

  const schema = getGoalRule(goalType).setupFields;
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
