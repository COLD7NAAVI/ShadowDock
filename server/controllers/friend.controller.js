import asyncHandler
    from "../utils/asyncHandler.js";

import * as friendService
    from "../services/friend.service.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Friend Controller
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
| Send Friend Request
|--------------------------------------------------------------------------
*/

export const sendRequest =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const friendship =

                await friendService.sendFriendRequest(

                    req.user.id,

                    req.params.publicId

                );

            return res

                .status(201)

                .json({

                    success: true,

                    message:

                        "Friend request sent successfully",

                    data: friendship

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Incoming Friend Requests
|--------------------------------------------------------------------------
*/

export const getIncomingRequests =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const requests =

                await friendService.getIncomingRequests(

                    req.user.id

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: requests

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Outgoing Friend Requests
|--------------------------------------------------------------------------
*/

export const getOutgoingRequests =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const requests =

                await friendService.getOutgoingRequests(

                    req.user.id

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: requests

                });

        }

    );
/*
|--------------------------------------------------------------------------
| Accept Friend Request
|--------------------------------------------------------------------------
*/

export const acceptRequest =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const friendship =

                await friendService.acceptFriendRequest(

                    req.user.id,

                    req.params.publicId

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Friend request accepted",

                    data: friendship

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Reject Friend Request
|--------------------------------------------------------------------------
*/

export const rejectRequest =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const friendship =

                await friendService.rejectFriendRequest(

                    req.user.id,

                    req.params.publicId

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Friend request rejected",

                    data: friendship

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Get Friends
|--------------------------------------------------------------------------
*/

export const getFriends =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const friends =

                await friendService.getFriends(

                    req.user.id

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: friends

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
| ✓ Format JSON Responses
| ✓ Return Proper HTTP Status Codes
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