import { param } from "express-validator";

export const publicIdValidator = [
  param("publicId")
    .isUUID()
    .withMessage("Invalid user id"),
];