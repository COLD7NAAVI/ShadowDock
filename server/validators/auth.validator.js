import {
  body,
  validationResult,
} from "express-validator";

import ApiError from "../utils/ApiError.js";

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({
      min: 3,
      max: 30,
    })
    .withMessage(
      "Username must be between 3 and 30 characters"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage(
      "Please provide a valid email"
    )
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({
      min: 8,
    })
    .withMessage(
      "Password must be at least 8 characters"
    )
    .matches(/[A-Z]/)
    .withMessage(
      "Password must contain an uppercase letter"
    )
    .matches(/[a-z]/)
    .withMessage(
      "Password must contain a lowercase letter"
    )
    .matches(/[0-9]/)
    .withMessage(
      "Password must contain a number"
    ),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export function validate(
  req,
  res,
  next
) {
  const errors =
    validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        400,
        "Validation failed",
        errors.array()
      )
    );
  }

  next();
}