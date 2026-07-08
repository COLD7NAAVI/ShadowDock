import { Router } from "express";

import auth
  from "../../middleware/auth.middleware.js";

import validate
  from "../../middleware/validate.middleware.js";

import {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  rejectRequest,
  getFriends,
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

router.post(
  "/accept/:publicId",
  auth,
  publicIdValidator,
  validate,
  acceptRequest
);

router.post(
  "/reject/:publicId",
  auth,
  publicIdValidator,
  validate,
  rejectRequest
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

router.get(
  "/",
  auth,
  getFriends
);

export default router;