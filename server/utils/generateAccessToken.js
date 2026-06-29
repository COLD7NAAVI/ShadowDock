import jwt from "jsonwebtoken";
import env from "../config/env.js";

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      publicId: user.public_id,
      username: user.username,
    },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpires,
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
    }
  );
}

export default generateAccessToken;