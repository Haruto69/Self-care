import express from "express";
import {
  createGoal,
  deleteGoal,
  getGoalById,
  getGoals,
  updateGoal
} from "../controllers/goalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getGoals).post(createGoal);
router.route("/:id").get(getGoalById).put(updateGoal).delete(deleteGoal);

export default router;
