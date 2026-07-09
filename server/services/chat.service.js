import {
    getClient
} from "../config/db.js";

import ApiError from "../utils/ApiError.js";
import { getUserChats } from "../repositories/chat.repository.js";
import {
    findUserByPublicId,
    findPrivateChat,
    createPrivateChat,
    addChatMember
} from "../repositories/chat.repository.js";

/*
|--------------------------------------------------------------------------
| Create Private Chat
|--------------------------------------------------------------------------
|
| Creates a private conversation between two users.
|
| If a private chat already exists, it is returned.
|
| This operation is fully transactional.
|
*/

export async function createPrivateChatService(
    requesterId,
    targetPublicId
) {

    const client = await getClient();

    try {

        await client.query("BEGIN");

        // ------------------------------------------------------------
        // Validate target user
        // ------------------------------------------------------------

        const targetUser = await findUserByPublicId(
            targetPublicId
        );

        if (!targetUser) {
            throw new ApiError(
                404,
                "User not found."
            );
        }

        // ------------------------------------------------------------
        // Prevent self-chat
        // ------------------------------------------------------------

        if (targetUser.id === requesterId) {
            throw new ApiError(
                400,
                "You cannot create a chat with yourself."
            );
        }

        // ------------------------------------------------------------
        // Check whether private chat already exists
        // ------------------------------------------------------------

        const existingChat =
            await findPrivateChat(
                requesterId,
                targetUser.id
            );
        
        if (existingChat) {

            await client.query("COMMIT");

            return {
                chat: existingChat,
                created: false
            };
        }

        // ------------------------------------------------------------
        // Create private chat
        // ------------------------------------------------------------

        const chat =
            await createPrivateChat(
                client,
                requesterId,
                targetUser.id
            );

        // ------------------------------------------------------------
        // Add requester
        // ------------------------------------------------------------

        await addChatMember(
            client,
            {
                chatId: chat.chatId,
                userId: requesterId,
                role: "owner",
                createdBy: requesterId
            }
        );

        // ------------------------------------------------------------
        // Add target user
        // ------------------------------------------------------------

        await addChatMember(
            client,
            {
                chatId: chat.chatId,
                userId: targetUser.id,
                role: "member",
                invitedBy: requesterId,
                createdBy: requesterId
            }
        );

        // ------------------------------------------------------------
        // Commit
        // ------------------------------------------------------------

        await client.query("COMMIT");

        return {
            chat,
            created: true
        };

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }

}
export async function getUserChatsService(userId) {
    const chats = await getUserChats(userId);

    return chats;
}