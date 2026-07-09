import {
    getClient
} from "../config/db.js";

import ApiError from "../utils/ApiError.js";

import {

    getUserChats,

    findUserByPublicId,

    findPrivateChat,

    createPrivateChat,

    addChatMember

} from "../repositories/chat.repository.js";

/*
|--------------------------------------------------------------------------
| Create Private Chat Service
|--------------------------------------------------------------------------
|
| Creates a private conversation between two users.
|
| Workflow
| --------
| 1. Validate target user.
| 2. Prevent self-chat.
| 3. Return existing chat if found.
| 4. Create chat.
| 5. Add requester.
| 6. Add target.
| 7. Commit transaction.
|
*/

export async function createPrivateChatService({

    requesterId,

    targetPublicId

}) {

    const client = await getClient();

    try {

        await client.query("BEGIN");

        /*
        |--------------------------------------------------------------------------
        | Validate Target User
        |--------------------------------------------------------------------------
        */

        const targetUser = await findUserByPublicId(
            targetPublicId
        );

        if (!targetUser) {

            throw new ApiError(

                404,

                "User not found."

            );

        }

        /*
        |--------------------------------------------------------------------------
        | Prevent Self Chat
        |--------------------------------------------------------------------------
        */

        if (targetUser.id === requesterId) {

            throw new ApiError(

                400,

                "You cannot create a chat with yourself."

            );

        }

        /*
        |--------------------------------------------------------------------------
        | Return Existing Private Chat
        |--------------------------------------------------------------------------
        */

        const existingChat = await findPrivateChat(

            requesterId,

            targetUser.id

        );

        if (existingChat) {

            await client.query("COMMIT");

            return {

                created: false,

                chat: existingChat

            };

        }

        /*
        |--------------------------------------------------------------------------
        | Create Chat
        |--------------------------------------------------------------------------
        */

        const chat = await createPrivateChat(

            client,

            requesterId

        );

        /*
        |--------------------------------------------------------------------------
        | Add Requester
        |--------------------------------------------------------------------------
        */

        await addChatMember(

            client,

            {

                chatId: chat.chatId,

                userId: requesterId,

                role: "owner"

            }

        );

        /*
        |--------------------------------------------------------------------------
        | Add Target User
        |--------------------------------------------------------------------------
        */

        await addChatMember(

            client,

            {

                chatId: chat.chatId,

                userId: targetUser.id,

                role: "member"

            }

        );

        /*
        |--------------------------------------------------------------------------
        | Commit Transaction
        |--------------------------------------------------------------------------
        */

        await client.query("COMMIT");

        return {

            created: true,

            chat

        };

    }

    catch (error) {

        /*
        |--------------------------------------------------------------------------
        | Rollback Transaction
        |--------------------------------------------------------------------------
        */

        try {

            await client.query("ROLLBACK");

        }

        catch {

            /*
            | Ignore rollback failure.
            | Original error is more important.
            */

        }

        throw error;

    }

    finally {

        client.release();

    }

}
export async function getUserChatsService(userId) {
    const chats = await getUserChats(userId);

    return chats;
}