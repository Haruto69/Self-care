import express from "express";
import { getMe, login, register } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many auth attempts. Please try again in 15 minutes."
});

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.get("/me", protect, getMe);

export default router;
