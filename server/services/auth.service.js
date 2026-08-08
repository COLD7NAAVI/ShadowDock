import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import env from "../config/env.js";
import { getClient } from "../config/db.js";

import ApiError from "../utils/ApiError.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import hashRefreshToken from "../utils/hashRefreshToken.js";
import { generatePublicId } from "../utils/idGenerator.js";

import {
  findExistingUser,
  findUserByEmail,
  findUserById,
  createUser,
  findDeviceByIdentifier,
  createDevice,
  updateDeviceActivity,
  createSession,
  findSessionByPublicId,
  findSessionByRefreshHash,
  updateRefreshToken,
  updateSessionActivity,
  revokeSession,
  revokeAllUserSessions,
} from "../repositories/auth.repository.js";

/* ============================================================
   Password Helpers
============================================================ */

async function hashPassword(password) {
  return bcrypt.hash(password, env.security.bcryptRounds);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function getRefreshExpiryDate() {
  return new Date(Date.now() + env.cookie.refreshMaxAge);
}

function buildTokenPayload(user) {
  return {
    id: user.id,
    publicId: user.public_id,
    username: user.username,
  };
}

/* ============================================================
   Transaction Helper
============================================================ */

async function withTransaction(callback) {
  const client = await getClient();

  try {
    await client.query("BEGIN");

    const result = await callback(client);

    await client.query("COMMIT");

    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/* ============================================================
   Authentication
============================================================ */
export async function register({
  username,
  displayName,
  email,
  password,
  device,
  ipAddress = null,
  userAgent = null,
}) {
  const existing = await findExistingUser(username, email);

  if (existing) {
    if (existing.username_taken) {
      throw new ApiError(409, "Username already taken");
    }

    if (existing.email_taken) {
      throw new ApiError(409, "Email already registered");
    }
  }

  const passwordHash = await hashPassword(password);

  return withTransaction(async (client) => {
    /* --------------------------------------------------
         Create User
      -------------------------------------------------- */

    const user = await createUser(client, {
      publicId: generatePublicId("usr"),
      username,
      displayName: displayName ?? username,
      email,
      passwordHash,
    });

    /* --------------------------------------------------
         Device
      -------------------------------------------------- */

    let deviceRecord = await findDeviceByIdentifier(
      user.id,
      device.deviceIdentifier,
    );

    if (!deviceRecord) {
      deviceRecord = await createDevice(client, {
        publicId: generatePublicId("dev"),
        userId: user.id,

        deviceName: device.deviceName,

        manufacturer: device.manufacturer,

        model: device.model,

        deviceType: device.deviceType,

        operatingSystem: device.operatingSystem,

        osVersion: device.osVersion,

        appVersion: device.appVersion,

        cpuArchitecture: device.cpuArchitecture,

        deviceIdentifier: device.deviceIdentifier,

        lastIpAddress: ipAddress,

        lastUserAgent: userAgent,
      });
    }

    /* --------------------------------------------------
       Tokens
    -------------------------------------------------- */

    const sessionPublicId = generatePublicId("sess");

    const payload = {
      ...buildTokenPayload(user),
      sessionPublicId,
    };

    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken(payload);

    const refreshTokenHash = hashRefreshToken(refreshToken);

    /* --------------------------------------------------
        Session
    -------------------------------------------------- */

    await createSession(client, {
      publicId: sessionPublicId,

      userId: user.id,

      deviceId: deviceRecord.id,

      refreshTokenHash,

      ipAddress,

      userAgent,

      country: null,

      city: null,

      expiresAt: getRefreshExpiryDate(),

      metadata: {},
    });
    return {
      user: {
        publicId: user.public_id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        avatar: user.avatar,
      },

      accessToken,
      refreshToken,
    };
  });
}
export async function login({
  email,
  password,
  device,
  ipAddress = null,
  userAgent = null,
}) {
  const user = await findUserByEmail(email);
  

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  
  const passwordValid = await verifyPassword(password, user.password_hash);

  if (!passwordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return withTransaction(async (client) => {
    /* ------------------------------------------
         Device
      ------------------------------------------ */

    let deviceRecord = await findDeviceByIdentifier(
      user.id,
      device.deviceIdentifier,
    );

    if (!deviceRecord) {
      deviceRecord = await createDevice(client, {
        publicId: generatePublicId("dev"),

        userId: user.id,

        deviceName: device.deviceName,

        manufacturer: device.manufacturer,

        model: device.model,

        deviceType: device.deviceType,

        operatingSystem: device.operatingSystem,

        osVersion: device.osVersion,

        appVersion: device.appVersion,

        cpuArchitecture: device.cpuArchitecture,

        deviceIdentifier: device.deviceIdentifier,

        lastIpAddress: ipAddress,

        lastUserAgent: userAgent,
      });
    } else {
      await updateDeviceActivity(client, deviceRecord.id, ipAddress, userAgent);
    }

    /* ------------------------------------------
         JWT Payload
      ------------------------------------------ */

    const sessionPublicId = generatePublicId("sess");

    const payload = {
      ...buildTokenPayload(user),
      sessionPublicId,
    };

    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken(payload);

    const refreshTokenHash = hashRefreshToken(refreshToken);

    /* ------------------------------------------
         Session
      ------------------------------------------ */

    await createSession(client, {
      publicId: sessionPublicId,

      userId: user.id,

      deviceId: deviceRecord.id,

      refreshTokenHash,

      ipAddress,

      userAgent,

      country: null,

      city: null,

      expiresAt: getRefreshExpiryDate(),

      metadata: {},
    });

    return {
      user: {
        publicId: user.public_id,

        username: user.username,

        displayName: user.display_name,

        email: user.email,

        avatar: user.avatar,
      },

      accessToken,
      refreshToken,
    };
  });
}
export async function refresh(
  refreshToken,
  ipAddress = null,
  userAgent = null,
) {
  try {
    jwt.verify(refreshToken, env.jwt.refreshSecret, {
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    });
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const refreshTokenHash = hashRefreshToken(refreshToken);

  const session = await findSessionByRefreshHash(refreshTokenHash);

  if (!session) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (session.session_state !== "active") {
    throw new ApiError(401, "Session is no longer active");
  }

  if (new Date(session.expires_at) < new Date()) {
    throw new ApiError(401, "Refresh token expired");
  }

  const user = await findUserById(session.user_id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return withTransaction(async (client) => {
    const payload = {
      ...buildTokenPayload(user),
      sessionPublicId: session.public_id,
    };

    const newAccessToken = generateAccessToken(payload);

    const newRefreshToken = generateRefreshToken(payload);

    const newRefreshHash = hashRefreshToken(newRefreshToken);

    await updateRefreshToken(client, session.id, newRefreshHash);

    await updateSessionActivity(client, session.id, ipAddress, userAgent);

    if (session.device_id) {
      await updateDeviceActivity(
        client,
        session.device_id,
        ipAddress,
        userAgent,
      );
    }

    return {
      accessToken: newAccessToken,

      refreshToken: newRefreshToken,
    };
  });
}
export async function logout(sessionPublicId, userId) {
  const session = await findSessionByPublicId(sessionPublicId);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.user_id !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return withTransaction(async (client) => {
    await revokeSession(client, session.id, userId, "User logout");

    return {
      success: true,
    };
  });
}
export async function logoutAll(userId) {
  return withTransaction(async (client) => {
    const revoked = await revokeAllUserSessions(
      client,
      userId,
      userId,
      "Logout from all devices",
    );

    return {
      success: true,
      revokedSessions: revoked.length,
    };
  });
}
export async function getMe(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
}
