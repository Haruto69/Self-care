import CheckIn from "../models/CheckIn.js";
import Goal from "../models/Goal.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  validateGoalType,
  validateObjectId,
  validateOptionalBoolean,
  validateSelectedOptions
} from "../utils/validation.js";

export const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(goals);
});

export const createGoal = asyncHandler(async (req, res) => {
  const { goalType, selectedOptions = {}, isActive = true } = req.body;
  const validatedGoalType = validateGoalType(goalType);
  const validatedOptions = validateSelectedOptions(validatedGoalType, selectedOptions);
  const validatedIsActive = validateOptionalBoolean(isActive, "isActive");

  const goal = await Goal.create({
    userId: req.user._id,
    goalType: validatedGoalType,
    selectedOptions: validatedOptions,
    isActive: validatedIsActive
  });

  res.status(201).json(goal);
});

export const getGoalById = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, "goal id");

  const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

  if (!goal) {
    res.status(404);
    throw new Error("Goal not found");
  }

  res.json(goal);
});

export const updateGoal = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, "goal id");

  const currentGoal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

  if (!currentGoal) {
    res.status(404);
    throw new Error("Goal not found");
  }

  const nextGoalType =
    req.body.goalType === undefined ? currentGoal.goalType : validateGoalType(req.body.goalType);
  const allowedUpdates = {
    goalType: nextGoalType,
    selectedOptions:
      req.body.selectedOptions === undefined
        ? undefined
        : validateSelectedOptions(nextGoalType, req.body.selectedOptions),
    isActive: validateOptionalBoolean(req.body.isActive, "isActive")
  };

  Object.keys(allowedUpdates).forEach((key) => {
    if (allowedUpdates[key] === undefined) delete allowedUpdates[key];
  });

  const goal = await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, allowedUpdates, {
    new: true,
    runValidators: true
  });

  res.json(goal);
});

export const deleteGoal = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id, "goal id");

  const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!goal) {
    res.status(404);
    throw new Error("Goal not found");
  }

  await Promise.all([
    Task.deleteMany({ goalId: goal._id, userId: req.user._id }),
    CheckIn.deleteMany({ goalId: goal._id, userId: req.user._id })
  ]);

  res.json({ message: "Goal and related data deleted" });
});
