import express from "express";
import { getPointHistory, getPointSummary } from "../controllers/pointController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/summary", getPointSummary);
router.get("/history", getPointHistory);

export default router;