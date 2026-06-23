import mongoose from "mongoose";
import { GOAL_TYPES } from "../goalRules/index.js";
import { POINT_REASONS } from "../config/pointsConfig.js";

const pointTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
    required: true
  },
  sourceGoal: {
    type: String,
    enum: GOAL_TYPES,
    required: true
  },
  pointsAwarded: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    enum: Object.values(POINT_REASONS),
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

pointTransactionSchema.index({ userId: 1, createdAt: -1 });
pointTransactionSchema.index({ userId: 1, taskId: 1, reason: 1 }, { unique: true });

const PointTransaction = mongoose.model("PointTransaction", pointTransactionSchema);

export default PointTransaction;