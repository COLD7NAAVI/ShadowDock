import { body } from "express-validator";
import { param } from "express-validator";

export const updateProfileValidator = [
  body("display_name")
    .optional()
    .isLength({
      min: 2,
      max: 100,
    }),

  body("bio")
    .optional()
    .isLength({
      max: 500,
    }),

  body("avatar_url")
    .optional()
    .isURL(),
];

export const publicIdValidator = [
  param("publicId")
    .isUUID()
    .withMessage("Invalid user id"),
];