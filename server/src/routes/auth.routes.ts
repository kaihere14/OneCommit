import { Router } from "express";

import {
  getUser,
  gitCallback,
  gitRedirect,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = Router();

router.get("/git-login", gitRedirect);
router.get("/git-callback", gitCallback);
router.get("/user", verifyJWT, getUser);

export default router;
