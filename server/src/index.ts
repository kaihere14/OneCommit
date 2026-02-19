import "dotenv/config";
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("OneCommit Server is running!");
});

app.get("/api/health", (req, res) => {
  res.send("OneCommit Server is running!");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
