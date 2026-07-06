import { Router } from "express";

import auth
  from "../../middleware/auth.middleware.js";

import validate
  from "../../middleware/validate.middleware.js";

import {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
} from "../../controllers/friend.controller.js";

import {
  publicIdValidator,
} from "../../validators/friend.validator.js";

const router = Router();

router.post(
  "/request/:publicId",
  auth,
  publicIdValidator,
  validate,
  sendRequest
);

router.get(
  "/requests/incoming",
  auth,
  getIncomingRequests
);

router.get(
  "/requests/outgoing",
  auth,
  getOutgoingRequests
);

export default router;