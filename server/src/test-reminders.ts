import "dotenv/config";

import { runCommitReminders } from "./controllers/git.controller.js";
import User from "./models/user.routes.js";
import { connectDB } from "./utils/connectDB.js";

async function main() {
  await connectDB();
  const res = await runCommitReminders();
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}

main();
