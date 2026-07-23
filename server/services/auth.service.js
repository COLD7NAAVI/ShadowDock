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
  return bcrypt.hash(
    password,
    env.security.bcryptRounds
  );
}

async function verifyPassword(
  password,
  hash
) {
  return bcrypt.compare(
    password,
    hash
  );
}

function getRefreshExpiryDate() {
  return new Date(
    Date.now() +
      env.cookie.refreshMaxAge
  );
}

/* ============================================================
   Transaction Helper
============================================================ */

async function withTransaction(callback) {
  const client =
    await getClient();

  try {
    await client.query("BEGIN");

    const result =
      await callback(client);

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