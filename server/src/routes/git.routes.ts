import { Router } from "express";

import { checkCommit } from "../controllers/git.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = Router();

router.get("/check-commit", verifyJWT, checkCommit);

export default router;
