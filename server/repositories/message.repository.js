import {
    query
} from "../config/db.js";

import {
    generateMessagePublicId
} from "../utils/idGenerator.js";

/*
|--------------------------------------------------------------------------
| Find Chat Member
|--------------------------------------------------------------------------
|
| Verifies that a user belongs to a chat.
|
| Used by the service layer before sending messages.
|
*/

export async function findChatMember(
    chatId,
    userId
) {

    const result = await query(

        `
        SELECT

            id,
            chat_id,
            user_id,
            role,
            joined_at

        FROM chat_members

        WHERE

            chat_id = $1

        AND

            user_id = $2

        LIMIT 1;
        `,

        [

            chatId,
            userId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Create Message
|--------------------------------------------------------------------------
|
| Creates a new message.
|
| NOTE:
| Attachments are inserted separately.
| Metadata is stored as JSONB for future extensibility.
|
*/

export async function createMessage(

    client,

    {

        chatId,

        senderId,

        text,

        messageType = "text",

        metadata = {}

    }

) {

    const publicId =
        generateMessagePublicId();

    const result =
        await client.query(

        `
        INSERT INTO messages (

            public_id,

            chat_id,

            sender_id,

            text,

            message_type,

            metadata

        )

        VALUES (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6

        )

        RETURNING

            id,

            public_id,

            chat_id,

            sender_id,

            text,

            message_type,

            metadata,

            is_edited,

            is_deleted,

            created_at,

            updated_at;
        `,

        [

            publicId,

            chatId,

            senderId,

            text,

            messageType,

            metadata

        ]

    );

    return result.rows[0];

}

/*
|--------------------------------------------------------------------------
| Get Chat Messages
|--------------------------------------------------------------------------
|
| Returns paginated messages.
|
| Supports:
|
| • Infinite scrolling
| • Sender information
| • Soft deleted messages
| • Future media messages
|
*/

export async function getChatMessages(

    chatPublicId,

    userId,

    limit = 50,

    before = null

) {

    const result = await query(

        `
        SELECT

            m.id,

            m.public_id,

            m.text,

            m.message_type,

            m.metadata,

            m.is_edited,

            m.is_deleted,

            m.created_at,

            m.updated_at,

            u.public_id
                AS sender_public_id,

            u.username,

            u.display_name,

            u.avatar_url
                AS sender_avatar,

            cm.role
                AS sender_role
        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        INNER JOIN users u

            ON u.id = m.sender_id

        INNER JOIN chat_members cm

            ON

                cm.chat_id = c.id

            AND

                cm.user_id = $2

        WHERE

            c.public_id = $1

        AND

            (

                $3::timestamptz IS NULL

                OR

                m.created_at < $3

            )

        ORDER BY

            m.created_at DESC

        LIMIT $4;
        `,

        [

            chatPublicId,

            userId,

            before,

            limit

        ]

    );

    /*
    ------------------------------------------------------------
    Reverse for chronological display
    ------------------------------------------------------------
    */

    return result.rows.reverse();

}

/*
|--------------------------------------------------------------------------
| Find Message By Public ID
|--------------------------------------------------------------------------
|
| Returns a single message.
|
| Used for:
|
| • Edit message
| • Delete message
| • Reply
| • Attachments
|
*/

export async function findMessageByPublicId(

    publicId

) {

    const result = await query(

        `
        SELECT

            id,

            public_id,

            chat_id,

            sender_id,

            text,

            message_type,

            metadata,

            is_edited,

            is_deleted,

            created_at,

            updated_at

        FROM messages

        WHERE

            public_id = $1

        LIMIT 1;
        `,

        [

            publicId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Update Message
|--------------------------------------------------------------------------
|
| Updates the message text.
|
| Automatically marks the message as edited.
|
*/

export async function updateMessage(

    client,

    {

        messageId,

        text,

        metadata = {}

    }

) {

    const result = await client.query(

        `
        UPDATE messages

        SET

            text = $1,

            metadata = $2,

            is_edited = TRUE,

            updated_at = NOW()

        WHERE

            id = $3

        RETURNING

            id,

            public_id,

            chat_id,

            sender_id,

            text,

            message_type,

            metadata,

            is_edited,

            is_deleted,

            created_at,

            updated_at;
        `,

        [

            text,

            metadata,

            messageId

        ]

    );

    return result.rows[0] ?? null;

}                
/*
|--------------------------------------------------------------------------
| Soft Delete Message
|--------------------------------------------------------------------------
|
| Soft deletes a message instead of permanently removing it.
|
| The original content is replaced with NULL while preserving the
| message record for conversation history, replies and read receipts.
|
*/

export async function softDeleteMessage(

    client,

    messageId

) {

    const result = await client.query(

        `
        UPDATE messages

        SET

            text = NULL,

            metadata = '{}'::jsonb,

            is_deleted = TRUE,

            updated_at = NOW()

        WHERE

            id = $1

        RETURNING

            id,

            public_id,

            chat_id,

            sender_id,

            text,

            message_type,

            metadata,

            is_edited,

            is_deleted,

            created_at,

            updated_at;
        `,

        [

            messageId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Repository Notes
|--------------------------------------------------------------------------
|
| This repository intentionally contains ONLY database queries.
|
| Business rules belong inside the service layer.
|
| Current capabilities:
|
| ✓ Find chat membership
| ✓ Create messages
| ✓ Paginated message retrieval
| ✓ Find message by public ID
| ✓ Edit messages
| ✓ Soft delete messages
|
| Future extensions:
|
| • Attachments
| • Message reactions
| • Replies
| • Forwarded messages
| • Pins
| • Polls
| • Scheduled messages
| • Threaded conversations
|
|--------------------------------------------------------------------------
*/