import jwt from "jsonwebtoken";
import env from "../config/env.js";

/**
 * Generate Access Token.
 *
 * Expected payload:
 * {
 *   id,
 *   publicId,
 *   username
 * }
 */
function generateAccessToken(payload) {
  return jwt.sign(
    payload,
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpires,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    }
  );
}

export default generateAccessToken;