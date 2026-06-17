import express from "express";
import {
  generateTasks,
  getTaskHistory,
  getTodayTasks,
  toggleTask
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/today", getTodayTasks);
router.post("/generate", generateTasks);
router.put("/:id/toggle", toggleTask);
router.get("/history", getTaskHistory);

export default router;
