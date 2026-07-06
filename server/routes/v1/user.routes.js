import { Router } from "express";

import auth from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  me,
  updateMe,
  profile,
  search,
} from "../../controllers/user.controller.js";

import {
  updateProfileValidator,
  publicIdValidator,
} from "../../validators/user.validator.js";

const router = Router();

router.get(
  "/me",
  auth,
  me
);

router.patch(
  "/me",
  auth,
  updateProfileValidator,
  validate,
  updateMe
);

router.get(
  "/search",
  auth,
  search
);

router.get(
  "/:publicId",
  auth,
  publicIdValidator,
  validate,
  profile
);

export default router;