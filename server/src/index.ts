import cors from "cors";
import "dotenv/config";
import express from "express";

import authRoutes from "./routes/auth.routes.js";
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
  })
  .catch(() => {
    console.log("MongoDB connection failed");
    process.exit(1);
  });
