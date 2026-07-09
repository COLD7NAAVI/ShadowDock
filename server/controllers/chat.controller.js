import asyncHandler from "../utils/asyncHandler.js";
import {
    createPrivateChatService
} from "../services/chat.service.js";

import {
    getUserChatsService
} from "../services/chat.service.js";

/*
|--------------------------------------------------------------------------
| Create Private Chat
|--------------------------------------------------------------------------
|
| POST /api/v1/chats/private
|
*/

export const createPrivateChat = asyncHandler(
    async (req, res) => {

        const { targetPublicId } = req.body;

        const requesterId = req.user.id;

        const result =
            await createPrivateChatService({
                requesterId,
                targetPublicId
            });

        return res.status(
            result.created ? 201 : 200
        ).json({

            success: true,

            message: result.created
                ? "Private chat created."
                : "Private chat already exists.",

            data: result.chat

        });

    }
);
export const getUserChats = asyncHandler(
    async (req, res) => {

        const chats = await getUserChatsService(
            req.user.id
        );

        return res.json({
            success: true,
            data: chats
        });

    }
);