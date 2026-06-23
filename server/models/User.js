import mongoose from "mongoose";

const pointsProfileSchema = new mongoose.Schema(
  {
    totalPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    lifetimePoints: {
      type: Number,
      default: 0,
      min: 0
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1
    },
    pointsEarnedToday: {
      type: Number,
      default: 0,
      min: 0
    },
    lastPointAwardDate: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  pointsProfile: {
    type: pointsProfileSchema,
    default: () => ({})
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

export default User;