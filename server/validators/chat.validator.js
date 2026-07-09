import { body, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/*
|--------------------------------------------------------------------------
| Validation Error Handler
|--------------------------------------------------------------------------
*/

function handleValidationResult(req, res, next) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg
    }));

    throw new ApiError(
        400,
        "Validation failed.",
        formattedErrors
    );
}

/*
|--------------------------------------------------------------------------
| Create Private Chat
|--------------------------------------------------------------------------
*/

export const validateCreatePrivateChat = [

    body("targetPublicId")
        .exists({
            checkFalsy: true
        })
        .withMessage("Target user is required.")

        .bail()

        .isString()
        .withMessage("Target user must be a string.")

        .trim()

        .isLength({
            min: 5,
            max: 32
        })
        .withMessage(
            "Invalid public ID length."
        )

        .matches(/^user_[A-Za-z0-9]+$/)
        .withMessage(
            "Invalid public ID format."
        ),

    handleValidationResult
];