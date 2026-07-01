import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import env from "../config/env.js";

import ApiError from "../utils/ApiError.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import hashRefreshToken from "../utils/hashRefreshToken.js";

import {
  createUser,
  findUserByEmail,
  findUserById,
  saveRefreshToken,
  getRefreshToken,
  removeRefreshToken,
} from "../repositories/auth.repository.js";

export async function register({
  username,
  email,
  password,
}) {
  const existing =
    await findUserByEmail(email);

  if (existing) {
    throw new ApiError(
      409,
      "Email already registered"
    );
  }

  const passwordHash =
    await bcrypt.hash(password, env.security.bcryptRounds);

  const user =
    await createUser({
      username,
      email,
      passwordHash,
    });

  return user;
}

export async function login({
  email,
  password,
}) {
  const user =
    await findUserByEmail(email);

  if (!user) {
    throw new ApiError(
      401,
      "Invalid credentials"
    );
  }

  const valid =
    await bcrypt.compare(
      password,
      user.password_hash
    );

  if (!valid) {
    throw new ApiError(
      401,
      "Invalid credentials"
    );
  }

  const payload = {
    id: user.id,
    publicId: user.public_id,
    username: user.username,
    email: user.email,
  };

  const accessToken =
    generateAccessToken(payload);

  const refreshToken =
    generateRefreshToken(payload);

  const hashedToken =
    hashRefreshToken(refreshToken);

  await saveRefreshToken(
    user.id,
    hashedToken
  );

  return {
    user: {
      publicId: user.public_id,
      username: user.username,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}

export async function refresh(
  refreshToken
) {
  try {
    const payload = jwt.verify(
      refreshToken,
      env.jwt.refreshSecret,
      {
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      }
    );

    const storedToken =
      await getRefreshToken(
        payload.id
      );

    if (!storedToken) {
      throw new ApiError(
        401,
        "Invalid refresh token"
      );
    }

    const hashedToken =
      hashRefreshToken(
        refreshToken
      );

    if (
      storedToken !==
      hashedToken
    ) {
      throw new ApiError(
        401,
        "Invalid refresh token"
      );
    }

    const accessToken =
      generateAccessToken({
        id: payload.id,
        publicId:
          payload.publicId,
        username:
          payload.username,
        email: payload.email,
      });

    return {
      accessToken,
    };
  } catch {
    throw new ApiError(
      401,
      "Invalid refresh token"
    );
  }
}

export async function logout(
  userId
) {
  await removeRefreshToken(
    userId
  );
}

export async function getMe(
  userId
) {
  const user =
    await findUserById(
      userId
    );

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  return user;
}