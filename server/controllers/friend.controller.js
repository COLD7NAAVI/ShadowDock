import asyncHandler
  from "../utils/asyncHandler.js";

import * as friendService
  from "../services/friend.service.js";

export const sendRequest =
  asyncHandler(async (req, res) => {
    const friendship =
      await friendService.sendFriendRequest(
        req.user.id,
        req.params.publicId
      );

    res.status(201).json({
      success: true,
      message:
        "Friend request sent successfully",
      friendship,
    });
  });
  export const getIncomingRequests =
  asyncHandler(async (req, res) => {
    const requests =
      await friendService.getIncomingRequests(
        req.user.id
      );

    res.json({
      success: true,
      requests,
    });
  });

export const getOutgoingRequests =
  asyncHandler(async (req, res) => {
    const requests =
      await friendService.getOutgoingRequests(
        req.user.id
      );

    res.json({
      success: true,
      requests,
    });
  });