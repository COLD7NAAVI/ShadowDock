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

    throw new ApiError(

        400,

        "Validation failed.",

        errors.array().map(error => ({

            field: error.path,

            message: error.msg

        }))

    );

}

/*
|--------------------------------------------------------------------------
| Create Private Chat Validation
|--------------------------------------------------------------------------
*/

export const validateCreatePrivateChat = [

    body("targetPublicId")

        .exists({

            checkFalsy: true

        })

        .withMessage(

            "Target user is required."

        )

        .bail()

        .isString()

        .withMessage(

            "Target user must be a string."

        )

        .trim()

        .matches(/^usr_[A-Za-z0-9]{8}$/)

        .withMessage(

            "Invalid public ID."

        ),

    handleValidationResult

];