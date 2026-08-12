import { param } from "express-validator";

export const publicIdValidator = [
  param("publicId")
    .trim()
    .notEmpty()
    .withMessage("User public id is required")
    .matches(/^usr_[A-Za-z0-9]{8}$/)
    .withMessage("Invalid user id"),
];