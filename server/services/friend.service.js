import ApiError from "../utils/ApiError.js";

import {
  findUserByPublicId,
  findFriendship,
  createFriendRequest,
} from "../repositories/friend.repository.js";

export async function sendFriendRequest(
  senderId,
  receiverPublicId
) {
  const receiver =
    await findUserByPublicId(receiverPublicId);

  if (!receiver) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  if (senderId === receiver.id) {
    throw new ApiError(
      400,
      "You cannot send friend request to yourself"
    );
  }

  const existing =
    await findFriendship(
      senderId,
      receiver.id
    );

  if (existing) {
    throw new ApiError(
      400,
      `Friend request already ${existing.status}`
    );
  }

  return await createFriendRequest(
    senderId,
    receiver.id
  );
}