import { Router } from "express";

import {
  checkCommit,
  resetDailyCommitStatus,
  sendCommitReminders,
} from "../controllers/git.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = Router();

router.get("/check-commit", verifyJWT, checkCommit);
router.post("/remind", sendCommitReminders);
router.post("/reset-day", resetDailyCommitStatus);

export default router;
