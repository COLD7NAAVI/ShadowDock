import jwt from "jsonwebtoken";
import env from "../config/env.js";

function generateRefreshToken(
  payload
) {
  return jwt.sign(
    payload,
    env.jwt.refreshSecret,
    {
      expiresIn:
        env.jwt.refreshExpires,
      issuer:
        env.jwt.issuer,
      audience:
        env.jwt.audience,
    }
  );
}

export default generateRefreshToken;