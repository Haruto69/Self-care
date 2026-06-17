import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { syncTaskIndexes } from "./utils/taskMaintenance.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await syncTaskIndexes();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Could not start server:", error.message);
    process.exit(1);
  });
