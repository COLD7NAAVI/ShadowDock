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
    .optional({
      checkFalsy: true
    })
    .isURL(),
];

export const publicIdValidator = [
  param("publicId")
    .matches(/^usr_[A-Za-z0-9]{8}$/)
    .withMessage("Invalid user id"),
];