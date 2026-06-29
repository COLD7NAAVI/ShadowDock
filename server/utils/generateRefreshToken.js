import jwt from "jsonwebtoken";
import env from "../config/env.js";

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      publicId: user.public_id,
    },
    env.jwt.refreshSecret,
    {
      expiresIn: env.jwt.refreshExpires,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    }
  );
}

export default generateRefreshToken;