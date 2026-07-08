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
export async function acceptFriendRequest(
  receiverId,
  senderPublicId
) {
  // Find sender by public ID
  const sender =
    await friendRepository.findUserByPublicId(
      senderPublicId
    );

  if (!sender) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  // Find pending request
  const pendingRequest =
    await friendRepository.findPendingRequest(
      sender.id,
      receiverId
    );

  if (!pendingRequest) {
    throw new ApiError(
      404,
      "Friend request not found"
    );
  }

  // Accept request
  return await friendRepository.acceptFriendRequest(
    sender.id,
    receiverId
  );
}

export async function rejectFriendRequest(
  receiverId,
  senderPublicId
) {
  // Find sender
  const sender =
    await friendRepository.findUserByPublicId(
      senderPublicId
    );

  if (!sender) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  // Find pending request
  const pendingRequest =
    await friendRepository.findPendingRequest(
      sender.id,
      receiverId
    );

  if (!pendingRequest) {
    throw new ApiError(
      404,
      "Friend request not found"
    );
  }

  // Delete request
  return await friendRepository.rejectFriendRequest(
    sender.id,
    receiverId
  );
}

export async function getFriends(userId) {
  return await friendRepository.getFriends(userId);
}