import asyncHandler
    from "../utils/asyncHandler.js";

import {

    saveMessage,

    getChatMessagesService,

    editMessageService,

    deleteMessageService

} from "../services/message.service.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Message Controller
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
| Send Message
|--------------------------------------------------------------------------
|
| POST /api/v1/messages
|
| Body
|
| {
|     chatPublicId,
|     text,
|     messageType,
|     metadata
| }
|
*/

export const sendMessage =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const {

                chatPublicId,

                text,

                messageType = "text",

                metadata = {}

            } = req.body;

            const message =

                await saveMessage(

                    chatPublicId,

                    req.user.id,

                    {

                        text,

                        messageType,

                        metadata

                    }

                );

            return res

                .status(201)

                .json({

                    success: true,

                    message:

                        "Message sent successfully.",

                    data: message

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Get Chat Messages
|--------------------------------------------------------------------------
|
| GET /api/v1/messages/chat/:chatPublicId
|
| Query Parameters
|
| ?limit=50
| ?before=2026-07-09T12:00:00Z
|
*/

export const getChatMessages =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const {

                chatPublicId

            } = req.params;

            const {

                limit = 50,

                before = null

            } = req.query;

            const messages =

                await getChatMessagesService(

                    chatPublicId,

                    req.user.id,

                    Number(limit),

                    before

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: messages,

                    pagination: {

                        limit: Number(limit),

                        before

                    }

                });

        }

    );
/*
|--------------------------------------------------------------------------
| Edit Message
|--------------------------------------------------------------------------
|
| PATCH /api/v1/messages/:messagePublicId
|
*/

export const editMessage =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const {

                messagePublicId

            } = req.params;

            const {

                text,

                metadata = {}

            } = req.body;

            const message =

                await editMessageService(

                    messagePublicId,

                    req.user.id,

                    {

                        text,

                        metadata

                    }

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Message updated successfully.",

                    data: message

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Delete Message
|--------------------------------------------------------------------------
|
| DELETE /api/v1/messages/:messagePublicId
|
*/

export const deleteMessage =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const {

                messagePublicId

            } = req.params;

            const message =

                await deleteMessageService(

                    messagePublicId,

                    req.user.id

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Message deleted successfully.",

                    data: message

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
| ✓ Transaction Ready
| ✓ Socket.IO Ready
| ✓ Infinite Scroll Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/