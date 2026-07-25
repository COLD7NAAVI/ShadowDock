import * as userService from "../services/user.service.js";

import asyncHandler from "../utils/asyncHandler.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| User Controller
|
| Responsibilities
|
| ✓ HTTP Request Handling
| ✓ Response Formatting
| ✓ Delegate Business Logic To Service
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Get Current User Profile
|--------------------------------------------------------------------------
*/

export const me =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const user =

                await userService.getMyProfile(

                    req.user.id

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: user

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Update Current User Profile
|--------------------------------------------------------------------------
*/

export const updateMe =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const user =

                await userService.editProfile(

                    req.user.id,

                    req.body

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Profile updated successfully",

                    data: user

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Get Public Profile
|--------------------------------------------------------------------------
*/

export const profile =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const user =

                await userService.getProfile(

                    req.params.publicId

                );

            if (

                !user

            ) {

                return res

                    .status(404)

                    .json({

                        success: false,

                        message:

                            "User not found"

                    });

            }

            return res

                .status(200)

                .json({

                    success: true,

                    data: user

                });

        }

    );
/*
|--------------------------------------------------------------------------
| Search Users
|--------------------------------------------------------------------------
*/

export const search =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const users =

                await userService.findUsers(

                    req.query.q ?? ""

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: users

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Controller Summary
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Parse HTTP Requests
| ✓ Call Service Layer
| ✓ Format HTTP Responses
| ✓ Return Proper Status Codes
|
|--------------------------------------------------------------------------
|
| Controller MUST
|
| ✓ Receive HTTP Requests
| ✓ Delegate Business Logic
| ✓ Return JSON Responses
| ✓ Throw Errors Through asyncHandler
|
|--------------------------------------------------------------------------
|
| Controller MUST NEVER
|
| ✗ Execute SQL
| ✗ Access Database
| ✗ Apply Business Logic
| ✗ Modify Repository Data Directly
|
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ Thin Controller
| ✓ Service Driven
| ✓ Repository Pattern
| ✓ Future Socket.IO Compatible
|
|--------------------------------------------------------------------------
*/