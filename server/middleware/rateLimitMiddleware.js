import { tooManyRequests } from "../utils/httpErrors.js";

export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 10,
  message = "Too many requests. Please try again later."
} = {}) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.ip}:${req.originalUrl}`;
    const now = Date.now();
    const current = attempts.get(key);

    if (!current || current.resetAt <= now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= max) {
      next(tooManyRequests(message));
      return;
    }

    current.count += 1;
    attempts.set(key, current);
    next();
  };
};
