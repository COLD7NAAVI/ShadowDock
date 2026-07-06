import { Router } from "express";

import auth from "../../middleware/auth.middleware.js";

import {
  register,
  login,
  refresh,
  logout,
  me,
} from "../../controllers/auth.controller.js";

import {
  registerValidator,
  loginValidator,
} from "../../validators/auth.validator.js";

import validate from "../../middleware/validate.middleware.js";

import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} from "../../middleware/rateLimit.middleware.js";

const router = Router();

router.post(
  "/register",
  registerLimiter,
  registerValidator,
  validate,
  register
);

router.post(
  "/login",
  loginLimiter,
  loginValidator,
  validate,
  login
);

router.post(
  "/refresh",
  refreshLimiter,
  refresh
);

router.post(
  "/logout",
  auth,
  logout
);

router.get(
  "/me",
  auth,
  me
);

export default router;