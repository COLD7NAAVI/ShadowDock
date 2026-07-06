import ApiError from "../utils/ApiError.js";

import * as friendRepository
  from "../repositories/friend.repository.js";

export async function sendFriendRequest(
  senderId,
  receiverPublicId
) {
  const receiver =
    await friendRepository.findUserByPublicId(
      receiverPublicId
    );

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
    await friendRepository.findFriendship(
      senderId,
      receiver.id
    );

  if (existing) {
    throw new ApiError(
      400,
      `Friend request already ${existing.status}`
    );
  }

  return await friendRepository.createFriendRequest(
    senderId,
    receiver.id
  );
}

export async function getIncomingRequests(
  userId
) {
  return await friendRepository.getIncomingRequests(
    userId
  );
}

export async function getOutgoingRequests(
  userId
) {
  return await friendRepository.getOutgoingRequests(
    userId
  );
}