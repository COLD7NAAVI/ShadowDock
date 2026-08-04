import * as authService from "../services/auth.service.js";

import asyncHandler from "../utils/asyncHandler.js";

import env from "../config/env.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Authentication Controller
|
| Responsibilities
|
| ✓ HTTP Request Handling
| ✓ Cookie Management
| ✓ Response Formatting
| ✓ Delegate Business Logic To Service
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Refresh Cookie Helper
|--------------------------------------------------------------------------
*/

function setRefreshCookie(

    res,

    refreshToken

) {

    res.cookie(

        env.cookie.refreshCookieName,

        refreshToken,

        {

            ...env.cookie.options,

            maxAge:

                env.cookie.refreshMaxAge

        }

    );

}

/*
|--------------------------------------------------------------------------
| Clear Refresh Cookie
|--------------------------------------------------------------------------
*/

function clearRefreshCookie(

    res

) {

    res.clearCookie(

        env.cookie.refreshCookieName,

        env.cookie.options

    );

}

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

export const register =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const result =

                await authService.register(

                    {

                        ...req.body,

                        ipAddress:

                            req.ip,

                        userAgent:

                            req.get(

                                "user-agent"

                            ) ?? null

                    }

                );

            const {

                refreshToken,

                ...response

            } = result;

            setRefreshCookie(

                res,

                refreshToken

            );

            return res

                .status(201)

                .json({

                    success: true,

                    message:

                        "Account created successfully",

                    ...response

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

export const login =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const result =

                await authService.login(

                    {

                        ...req.body,

                        ipAddress:

                            req.ip,

                        userAgent:

                            req.get(

                                "user-agent"

                            ) ?? null

                    }

                );

            const {

                refreshToken,

                ...response

            } = result;

            setRefreshCookie(

                res,

                refreshToken

            );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Login successful",

                    ...response

                });

        }

    );
/*
|--------------------------------------------------------------------------
| Refresh Access Token
|--------------------------------------------------------------------------
*/

export const refresh =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const refreshToken =

                req.cookies?.[

                    env.cookie.refreshCookieName

                ];

            if (

                !refreshToken

            ) {

                return res

                    .status(401)

                    .json({

                        success: false,

                        message:

                            "Refresh token missing"

                    });

            }

            const result =

                await authService.refresh(

                    refreshToken,

                    req.ip,

                    req.get(

                        "user-agent"

                    ) ?? null

                );

            const {

                refreshToken,
                ...response

            } = result;

            setRefreshCookie(

                res,

                RefreshToken

            );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Token refreshed",

                    ...response

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

export const logout =

    asyncHandler(

        async (

            req,

            res

        ) => {

            await authService.logout(

                req.user.sessionPublicId,

                req.user.id

            );

            clearRefreshCookie(

                res

            );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Logged out successfully"

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Logout From All Devices
|--------------------------------------------------------------------------
*/

export const logoutAll =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const result =

                await authService.logoutAll(

                    req.user.id

                );

            clearRefreshCookie(

                res

            );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Logged out from all devices",

                    ...result

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Get Current User
|--------------------------------------------------------------------------
*/

export const me =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const user =

                await authService.getMe(

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
| Controller Summary
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Parse HTTP Requests
| ✓ Read Cookies
| ✓ Set Cookies
| ✓ Format Responses
| ✓ Delegate Business Logic
|
|--------------------------------------------------------------------------
|
| Controller MUST
|
| ✓ Receive Request
| ✓ Call Service Layer
| ✓ Return HTTP Response
| ✓ Set/Clear Cookies
|
|--------------------------------------------------------------------------
|
| Controller MUST NEVER
|
| ✗ Execute SQL
| ✗ Access Database
| ✗ Apply Business Logic
| ✗ Generate JWT
| ✗ Validate Credentials
|
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ Thin Controller
| ✓ Service Driven
| ✓ Repository Pattern
| ✓ Secure Cookie Handling
|
|--------------------------------------------------------------------------
*/