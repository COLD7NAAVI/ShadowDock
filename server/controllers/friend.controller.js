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