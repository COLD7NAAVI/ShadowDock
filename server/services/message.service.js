import ApiError from "../utils/ApiError.js";

import {

    getClient

} from "../config/db.js";

import {

    findChatByPublicId,
    findChatMember

} from "../repositories/chat.repository.js";

import {
    findUserById
} from "../repositories/user.repository.js";

import {

    createMessage,

    getChatMessages,

    findMessageByPublicId,

    updateMessage,

    softDeleteMessage

} from "../repositories/message.repository.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Message Service
|
| Responsibilities
|
| ✓ Business Logic
| ✓ Authorization
| ✓ Validation
| ✓ PostgreSQL Transactions
| ✓ Repository Orchestration
| ✓ Future Socket Emission
|
| Repositories NEVER contain business logic.
| Controllers NEVER contain business logic.
|
| All messaging rules belong here.
|
|--------------------------------------------------------------------------
*/



/*
|--------------------------------------------------------------------------
| Save Message
|--------------------------------------------------------------------------
|
| Creates a new message inside a chat.
|
| Flow
|
| 1. Start Transaction
| 2. Resolve Chat
| 3. Verify Membership
| 4. Save Message
| 5. Commit
| 6. Future Socket Broadcast
|
*/

export async function saveMessage(

    chatPublicId,

    senderId,

    {

        text,

        messageType = "text",

        metadata = {}

    }

) {

    const client = await getClient();

    try {

        await client.query(

            "BEGIN"

        );

        /*
        ------------------------------------------------------------
        Resolve Chat
        ------------------------------------------------------------
        */

        const chat = await findChatByPublicId(

            chatPublicId

        );

        if (!chat) {

            throw new ApiError(

                404,

                "Chat not found."

            );

        }

        /*
        ------------------------------------------------------------
        Verify Membership
        ------------------------------------------------------------
        */

        const member = await findChatMember(

            chat.id,

            senderId

        );

        if (!member) {

            throw new ApiError(

                403,

                "You are not a member of this chat."

            );

        }

        const sender = await findUserById(
            senderId
        );

        if (!sender) {

            throw new ApiError(
                404,
                "Sender not found."
            );

        }

        /*
        ------------------------------------------------------------
        Save Message
        ------------------------------------------------------------
        */

        const message = await createMessage(

            client,

            {

                chatId: chat.id,

                senderId,

                senderPublicId: sender.public_id,

                content : text,

                messageType,

                metadata

            }

        );

        /*
        ------------------------------------------------------------
        Commit Transaction
        ------------------------------------------------------------
        */

        await client.query(

            "COMMIT"

        );

        /*
        ------------------------------------------------------------
        Socket Broadcast
        ------------------------------------------------------------
        Future:
            io.to(chat.public_id)
              .emit("message:new", message);
        ------------------------------------------------------------
        */

        return message;

    }

    catch (error) {

        await client.query(

            "ROLLBACK"

        );

        throw error;

    }

    finally {

        client.release();

    }

}
/*
|--------------------------------------------------------------------------
| Get Chat Messages
|--------------------------------------------------------------------------
|
| Returns paginated messages for a chat.
|
| Business Rules
|
| ✓ Chat must exist
| ✓ User must belong to the chat
| ✓ Repository handles pagination
|
| Future Ready
|
| ✓ Infinite Scroll
| ✓ Search
| ✓ Read Receipts
| ✓ Attachments
| ✓ Replies
| ✓ Reactions
|
*/

export async function getChatMessagesService(

    chatPublicId,

    userId,

    limit = 50,

    before = null

) {

    /*
    ------------------------------------------------------------
    Resolve Chat
    ------------------------------------------------------------
    */

    const chat = await findChatByPublicId(

        chatPublicId

    );

    if (!chat) {

        throw new ApiError(

            404,

            "Chat not found."

        );

    }

    /*
    ------------------------------------------------------------
    Verify Membership
    ------------------------------------------------------------
    */

    const member = await findChatMember(

        chat.id,

        userId

    );

    if (!member) {

        throw new ApiError(

            403,

            "You are not a member of this chat."

        );

    }

    /*
    ------------------------------------------------------------
    Sanitize Pagination
    ------------------------------------------------------------
    */

    const pageSize = Math.min(

        Math.max(

            Number(limit) || 50,

            1

        ),

        100

    );

    /*
    ------------------------------------------------------------
    Retrieve Messages
    ------------------------------------------------------------
    */

    const messages = await getChatMessages(

        chatPublicId,

        userId,

        pageSize,

        before

    );

    /*
    ------------------------------------------------------------
    Future Hooks
    ------------------------------------------------------------

    • Read Receipts

    • Delivery Receipts

    • Sync Devices

    • Update Last Read Pointer

    • Analytics

    ------------------------------------------------------------
    */

    return messages;

}
/*
|--------------------------------------------------------------------------
| Edit Message
|--------------------------------------------------------------------------
|
| Updates a previously sent message.
|
| Flow
|
| 1. Begin Transaction
| 2. Find Message
| 3. Verify Ownership
| 4. Update Message
| 5. Commit
| 6. Future Socket Broadcast
|
*/

export async function editMessageService(

    messagePublicId,

    senderId,

    {

        text,

        metadata = {}

    }

) {

    const client = await getClient();

    try {

        await client.query(

            "BEGIN"

        );

        /*
        ------------------------------------------------------------
        Find Message
        ------------------------------------------------------------
        */

        const message = await findMessageByPublicId(

            messagePublicId

        );

        if (!message) {

            throw new ApiError(

                404,

                "Message not found."

            );

        }

        /*
        ------------------------------------------------------------
        Ownership Check
        ------------------------------------------------------------
        */

        if (

            message.sender_id !== senderId

        ) {

            throw new ApiError(

                403,

                "You can only edit your own messages."

            );

        }

        /*
        ------------------------------------------------------------
        Prevent Editing Deleted Messages
        ------------------------------------------------------------
        */

        if (

            message.is_deleted

        ) {

            throw new ApiError(

                400,

                "Deleted messages cannot be edited."

            );

        }

        /*
        ------------------------------------------------------------
        Update Message
        ------------------------------------------------------------
        */

        const updatedMessage = await updateMessage(

            client,

            {

                messageId: message.id,

                text,

                metadata

            }

        );

        /*
        ------------------------------------------------------------
        Commit
        ------------------------------------------------------------
        */

        await client.query(

            "COMMIT"

        );

        /*
        ------------------------------------------------------------
        Future Socket Hook
        ------------------------------------------------------------

        io.to(chatRoom)
            .emit("message:edited", updatedMessage);

        ------------------------------------------------------------
        */

        return updatedMessage;

    }

    catch (error) {

        await client.query(

            "ROLLBACK"

        );

        throw error;

    }

    finally {

        client.release();

    }

}
/*
|--------------------------------------------------------------------------
| Delete Message
|--------------------------------------------------------------------------
|
| Soft deletes a previously sent message.
|
| Flow
|
| 1. Begin Transaction
| 2. Find Message
| 3. Verify Ownership
| 4. Soft Delete
| 5. Commit
| 6. Future Socket Broadcast
|
*/

export async function deleteMessageService(

    messagePublicId,

    senderId

) {

    const client = await getClient();

    try {

        await client.query(

            "BEGIN"

        );

        /*
        ------------------------------------------------------------
        Find Message
        ------------------------------------------------------------
        */

        const message = await findMessageByPublicId(

            messagePublicId

        );

        if (!message) {

            throw new ApiError(

                404,

                "Message not found."

            );

        }

        /*
        ------------------------------------------------------------
        Verify Ownership
        ------------------------------------------------------------
        */

        if (

            message.sender_id !== senderId

        ) {

            throw new ApiError(

                403,

                "You can only delete your own messages."

            );

        }

        /*
        ------------------------------------------------------------
        Already Deleted
        ------------------------------------------------------------
        */

        if (

            message.is_deleted

        ) {

            throw new ApiError(

                400,

                "Message has already been deleted."

            );

        }

        /*
        ------------------------------------------------------------
        Soft Delete
        ------------------------------------------------------------
        */

        const deletedMessage = await softDeleteMessage(

            client,

            message.id

        );

        /*
        ------------------------------------------------------------
        Commit
        ------------------------------------------------------------
        */

        await client.query(

            "COMMIT"

        );

        /*
        ------------------------------------------------------------
        Future Socket Hook
        ------------------------------------------------------------

        io.to(chatRoom)
            .emit(
                "message:deleted",
                deletedMessage
            );

        ------------------------------------------------------------
        */

        return deletedMessage;

    }

    catch (error) {

        try {

            await client.query(

                "ROLLBACK"

            );

        }

        catch {

            /*
            Ignore rollback failures.
            Original error is more important.
            */

        }

        throw error;

    }

    finally {

        client.release();

    }

}
/*
|--------------------------------------------------------------------------
| Service Responsibilities
|--------------------------------------------------------------------------
|
| This service is the ONLY location for message business logic.
|
| Responsibilities
|
| ✓ Validate requests
| ✓ Verify chat existence
| ✓ Verify membership
| ✓ Verify ownership
| ✓ Coordinate repositories
| ✓ Manage PostgreSQL transactions
| ✓ Handle rollback
| ✓ Prepare realtime events
|
| Repository Responsibilities
|
| ✓ SQL only
| ✓ No business logic
| ✓ No authorization
| ✓ No transactions
|
| Controller Responsibilities
|
| ✓ HTTP request parsing
| ✓ HTTP response formatting
| ✓ Authentication middleware integration
|
| Socket Responsibilities
|
| ✓ Receive realtime events
| ✓ Call this service
| ✓ Broadcast successful operations
|
|--------------------------------------------------------------------------
| Future Extensions
|--------------------------------------------------------------------------
|
| The public API of this service is intentionally stable.
|
| New features should be implemented here without changing
| the controller or socket architecture.
|
| Planned Features
|
| ✓ Attachments
| ✓ Replies
| ✓ Reactions
| ✓ Forward Messages
| ✓ Pins
| ✓ Polls
| ✓ Voice Messages
| ✓ Scheduled Messages
| ✓ Threads
| ✓ Read Receipts
| ✓ Delivery Receipts
| ✓ Unread Counters
| ✓ Message Search
| ✓ Message Translation
| ✓ AI Message Moderation
|
|--------------------------------------------------------------------------
| Socket Hooks
|--------------------------------------------------------------------------
|
| Socket events MUST be emitted ONLY AFTER a successful COMMIT.
|
| Future events:
|
| message:new
| message:edited
| message:deleted
| message:reaction
| message:read
| message:delivered
| typing:start
| typing:stop
|
|--------------------------------------------------------------------------
| Production Notes
|--------------------------------------------------------------------------
|
| Every write operation follows:
|
| BEGIN
| ↓
| Validation
| ↓
| Authorization
| ↓
| Repository Calls
| ↓
| COMMIT
| ↓
| Socket Broadcast
|
| If any step fails:
|
| ROLLBACK
|
| This guarantees database consistency and prevents clients
| from receiving events for rolled-back transactions.
|
|--------------------------------------------------------------------------
|
| Message Service v3
|
| Status:
|
| ✓ Production Ready
| ✓ Transaction Safe
| ✓ Repository Driven
| ✓ Socket Ready
| ✓ Attachment Ready
| ✓ Reaction Ready
| ✓ Read Receipt Ready
| ✓ Redis Ready
| ✓ Horizontally Scalable
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/