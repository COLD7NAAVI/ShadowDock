import asyncHandler
    from "../utils/asyncHandler.js";

import {

    createPrivateChatService,

    getUserChatsService

} from "../services/chat.service.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Chat Controller
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
| Create Private Chat
|--------------------------------------------------------------------------
|
| POST /api/v1/chats/private
|
*/


export const createPrivateChat =

    asyncHandler(

        async (

            req,

            res

        ) => {

            console.log(
                 req.body
            );

            const {

                targetPublicId

            } = req.body;

            const requesterId =

                req.user.id;

            const result =

                await createPrivateChatService({

                    requesterId,

                    targetPublicId

                });

            return res

                .status(

                    result.created

                        ? 201

                        : 200

                )

                .json({

                    success: true,

                    message:

                        result.created

                            ? "Private chat created."

                            : "Private chat already exists.",

                    data:

                        result.chat

                });

        }

    );
/*
|--------------------------------------------------------------------------
| Get User Chats
|--------------------------------------------------------------------------
|
| GET /api/v1/chats
|
*/

export const getUserChats =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const chats =

                await getUserChatsService(

                    req.user.id

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: chats

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