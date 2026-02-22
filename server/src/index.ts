import cors from "cors";
import "dotenv/config";
import express from "express";
import cron from "node-cron";

import {
  runCommitReminders,
  runDailyReset,
} from "./controllers/git.controller.js";
import authRoutes from "./routes/auth.routes.js";
import gitRoutes from "./routes/git.routes.js";
import { connectDB } from "./utils/connectDB.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth/", authRoutes);
app.use("/api/v1/git/", gitRoutes);

app.get("/auth/success", (_req, res) => {
  res.send(
    `<!DOCTYPE html><html><head><title>OneCommit</title></head><body>
    <p>Login successful! This tab will close automatically.</p>
    </body></html>`
  );
});

app.get("/", (req, res) => {
  res.send("OneCommit Server is running!");
});

app.get("/api/health", (req, res) => {
  res.send("OneCommit Server is running!");
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });

    // Reminder slots: 09:00, 12:00, 15:00, 18:00, 21:00, 23:30 UTC
    cron.schedule("0 9,12,15,18,21 * * *", runCommitReminders);
    cron.schedule("30 23 * * *", runCommitReminders);

    // Midnight reset — clears commitedToday for all users
    cron.schedule("0 0 * * *", runDailyReset);
  })
  .catch(() => {
    console.log("MongoDB connection failed");
    process.exit(1);
  });
