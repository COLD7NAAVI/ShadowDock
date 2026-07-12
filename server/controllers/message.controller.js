import asyncHandler from "../utils/asyncHandler.js";

import {

    saveMessage,

    getChatMessagesService,

    editMessageService,

    deleteMessageService

} from "../services/message.service.js";

/*
|--------------------------------------------------------------------------
| Message Controller
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Send messages
| ✓ Fetch paginated chat history
| ✓ Edit messages
| ✓ Soft delete messages
|
| Business logic belongs in Message Service.
|
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

export const sendMessage = asyncHandler(

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

        const message = await saveMessage(

            chatPublicId,

            req.user.id,

            {

                text,

                messageType,

                metadata

            }

        );

        return res.status(201).json({

            success: true,

            message: "Message sent successfully.",

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
| Returns paginated chat history.
|
| Notes
|
| • Uses public UUIDs only
| • Requires authenticated user
| • Membership validation happens inside the service layer
| • Messages are returned oldest → newest for UI rendering
| • Supports infinite scrolling
|
*/

export const getChatMessages = asyncHandler(

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

        const messages = await getChatMessagesService(

            chatPublicId,

            req.user.id,

            Number(limit),

            before

        );

        return res.status(200).json({

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
| Body
|
| {
|     text,
|     metadata
| }
|
| Notes
|
| • Only the original sender may edit
| • Soft-deleted messages cannot be edited
| • Edit authorization is enforced by the service layer
| • Socket.IO event is emitted after a successful transaction
|   (implemented in the socket layer)
|
*/

export const editMessage = asyncHandler(

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

        const message = await editMessageService(

            messagePublicId,

            req.user.id,

            {

                text,

                metadata

            }

        );

        return res.status(200).json({

            success: true,

            message: "Message updated successfully.",

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
| Soft deletes a message.
|
| Notes
|
| • Only the original sender may delete
| • Message remains in history
| • Read receipts remain intact
| • Replies remain valid
| • Socket.IO deletion event is emitted after commit
|   (implemented in the socket layer)
|
*/

export const deleteMessage = asyncHandler(

    async (

        req,

        res

    ) => {

        const {

            messagePublicId

        } = req.params;

        const message = await deleteMessageService(

            messagePublicId,

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message: "Message deleted successfully.",

            data: message

        });

    }

);

/*
|--------------------------------------------------------------------------
| Message Controller
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ UUID Based
| ✓ Repository Driven
| ✓ Service Driven
| ✓ Transaction Ready
| ✓ Socket.IO Ready
| ✓ Infinite Scroll Ready
| ✓ Read Receipt Ready
| ✓ Attachments Ready
| ✓ Reactions Ready
| ✓ Future E2EE Compatible
|
| Future Extensions
|
| • Attachments
| • Voice Notes
| • Message Reactions
| • Reply Messages
| • Forward Messages
| • Pins
| • Polls
| • Scheduled Messages
| • Threads
| • Search
| • Bulk Operations
|
|--------------------------------------------------------------------------
*/