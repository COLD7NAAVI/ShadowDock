import jwt from "jsonwebtoken";

import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

function auth(
  req,
  res,
  next
) {
  const header =
    req.headers.authorization;

  if (
    !header ||
    !header.startsWith(
      "Bearer "
    )
  ) {
    return next(
      new ApiError(
        401,
        "Authentication required"
      )
    );
  }

  const token =
    header.split(" ")[1];

  try {
    const payload =
      jwt.verify(
        token,
        env.jwt.accessSecret,
        {
          issuer:
            env.jwt.issuer,
          audience:
            env.jwt.audience,
        }
      );

    req.user = payload;

    next();
  } catch {
    next(
      new ApiError(
        401,
        "Invalid token"
      )
    );
  }
}

export default auth;