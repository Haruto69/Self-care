import mongoose from "mongoose";
import { GOAL_TYPES } from "../goalRules/index.js";

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    goalType: {
      type: String,
      enum: GOAL_TYPES,
      required: true
    },
    selectedOptions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
