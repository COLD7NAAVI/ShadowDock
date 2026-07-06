import {
  getUserById,
  getUserByPublicId,
  updateProfile,
  searchUsers,
} from "../repositories/user.repository.js";

export async function getMyProfile(userId) {
  return await getUserById(userId);
}

export async function getProfile(publicId) {
  return await getUserByPublicId(publicId);
}

export async function editProfile(
  userId,
  data
) {
  return await updateProfile(
    userId,
    data
  );
}

export async function findUsers(query) {
  return await searchUsers(query);
}