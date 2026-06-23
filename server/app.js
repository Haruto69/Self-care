import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import checkInRoutes from "./routes/checkInRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();

const defaultClientOrigins = ["http://localhost:5173"];
const configuredClientOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedClientOrigins = configuredClientOrigins.length
  ? configuredClientOrigins
  : defaultClientOrigins;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedClientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "Self-care API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/checkins", checkInRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
