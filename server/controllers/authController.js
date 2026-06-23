import { performance } from "node:perf_hooks";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { badRequest } from "../utils/httpErrors.js";
import { validateEmail, validatePasswordStrength } from "../utils/validation.js";

const BCRYPT_SALT_ROUNDS = 10;

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt
});

const createLoginTimer = () => {
  const enabled = process.env.NODE_ENV === "development";
  const startedAt = performance.now();
  let previous = startedAt;

  return (label) => {
    if (!enabled) return;

    const now = performance.now();
    console.log(
      `[auth:login] ${label}: +${(now - previous).toFixed(1)}ms (${(now - startedAt).toFixed(1)}ms total)`
    );
    previous = now;
  };
};

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

  const existingUser = await User.exists({ email: normalizedEmail });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });

  res.status(201).json({
    token: signToken(user._id),
    user: buildUserResponse(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const markLoginStep = createLoginTimer();
  const { email, password } = req.body;

  if (typeof password !== "string" || !password) {
    throw badRequest("Email and password are required");
  }

  const normalizedEmail = validateEmail(email);
  markLoginStep("validated input");

  const user = await User.findOne({ email: normalizedEmail })
    .select("+passwordHash")
    .lean();
  markLoginStep("email lookup");

  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  markLoginStep("password compare");

  if (!user || !passwordMatches) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = signToken(user._id);
  markLoginStep("jwt sign");

  res.json({
    token,
    user: buildUserResponse(user)
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: buildUserResponse(req.user) });
});