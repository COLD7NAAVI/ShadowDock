import jwt from "jsonwebtoken";

import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

function auth(req, res, next) {
  const authorization =
    req.headers.authorization;

  if (!authorization) {
    return next(
      new ApiError(
        401,
        "Authentication required"
      )
    );
  }

  const [scheme, token] =
    authorization.split(" ");

  if (
    scheme !== "Bearer" ||
    !token
  ) {
    return next(
      new ApiError(
        401,
        "Invalid authorization header"
      )
    );
  }

  try {
    const payload = jwt.verify(
      token,
      env.jwt.accessSecret,
      {
        issuer: env.jwt.issuer,
        audience: env.jwt.audience,
      }
    );

    req.user = Object.freeze(payload);

    next();
  } catch (error) {
    if (
      error instanceof
        jwt.TokenExpiredError
    ) {
      return next(
        new ApiError(
          401,
          "Access token expired"
        )
      );
    }

    return next(
      new ApiError(
        401,
        "Invalid access token"
      )
    );
  }
}

export default auth;