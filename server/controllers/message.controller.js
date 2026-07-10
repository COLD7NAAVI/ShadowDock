import asyncHandler from "../utils/asyncHandler.js";

import {

    saveMessage,

    fetchMessages,

    getChatMessagesService,

    editMessageService,

    deleteMessageService

} from "../services/message.service.js";

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

        return res.status(

            201

        ).json({

            success: true,

            message: "Message sent successfully.",

            data: message

        });

    }

);

/*
|--------------------------------------------------------------------------
| Legacy Messages
|--------------------------------------------------------------------------
|
| GET /api/v1/messages/:chatId
|
| Internal numeric chat ID.
| Kept temporarily for backward compatibility.
|
*/

export const getMessages = asyncHandler(

    async (

        req,

        res

    ) => {

        const messages =

            await fetchMessages(

                req.params.chatId

            );

        return res.json({

            success: true,

            data: messages

        });

    }

);
/*
|--------------------------------------------------------------------------
| Chat Messages
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

        const messages =

            await getChatMessagesService(

                chatPublicId,

                req.user.id,

                Number(limit),

                before

            );

        return res.json({

            success: true,

            data: messages

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

        const message =

            await editMessageService(

                messagePublicId,

                req.user.id,

                {

                    text,

                    metadata

                }

            );

        return res.json({

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
*/

export const deleteMessage = asyncHandler(

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

        return res.json({

            success: true,

            message: "Message deleted successfully.",

            data: message

        });

    }

);

/*
|--------------------------------------------------------------------------
| Controller Summary
|--------------------------------------------------------------------------
|
| ✓ Send message
| ✓ Legacy message retrieval
| ✓ Paginated chat messages
| ✓ Edit message
| ✓ Soft delete message
|
| Future extensions:
|
| • Attachments
| • Reactions
| • Replies
| • Pins
| • Forward messages
| • Scheduled messages
| • Polls
| • Threaded conversations
| • Search messages
| • Bulk delete
|
*/