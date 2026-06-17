import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { badRequest } from "../utils/httpErrors.js";
import { validateEmail, validatePasswordStrength } from "../utils/validation.js";

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt
});

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it to server/.env.");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    throw badRequest("Name is required");
  }

  const normalizedEmail = validateEmail(email);
  validatePasswordStrength(password);

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });

  res.status(201).json({
    token: signToken(user._id),
    user: buildUserResponse(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (typeof password !== "string" || !password) {
    throw badRequest("Email and password are required");
  }

  const normalizedEmail = validateEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    token: signToken(user._id),
    user: buildUserResponse(user)
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: buildUserResponse(req.user) });
});
