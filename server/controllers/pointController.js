import asyncHandler from "../utils/asyncHandler.js";
import { getPointsSummary, listPointHistory } from "../services/pointService.js";

export const getPointSummary = asyncHandler(async (req, res) => {
  const summary = await getPointsSummary(req.user._id);
  res.json(summary);
});

export const getPointHistory = asyncHandler(async (req, res) => {
  const history = await listPointHistory(req.user._id);
  res.json(history);
});