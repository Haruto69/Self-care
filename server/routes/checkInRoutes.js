import express from "express";
import {
  createCheckIn,
  getCheckInSummary,
  getCheckIns
} from "../controllers/checkInController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").post(createCheckIn).get(getCheckIns);
router.get("/summary", getCheckInSummary);

export default router;
