import asyncHandler from "../utils/asyncHandler.js";

import {
    fetchMessages,
    getChatMessagesService
} from "../services/message.service.js";

/*
|--------------------------------------------------------------------------
| Legacy Messages
|--------------------------------------------------------------------------
|
| GET /api/v1/messages/:chatId
|
| Returns all messages using the internal chat ID.
| Kept for backward compatibility.
|
*/

export const getMessages = asyncHandler(
    async (req, res) => {

        const messages = await fetchMessages(
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
| Returns paginated messages for a chat.
|
| Query Parameters:
|
|   ?limit=50
|   ?before=2026-07-09T12:00:00Z
|
*/

export const getChatMessages = asyncHandler(
    async (req, res) => {

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