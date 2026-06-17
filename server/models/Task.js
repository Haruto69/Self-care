import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  taskKey: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly"],
    default: "daily"
  },
  date: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

taskSchema.index({ userId: 1, goalId: 1, date: 1 });
taskSchema.index(
  { userId: 1, goalId: 1, date: 1, taskKey: 1 },
  { unique: true, partialFilterExpression: { taskKey: { $exists: true } } }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
