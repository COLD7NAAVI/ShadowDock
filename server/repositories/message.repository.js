import {
    query
} from "../config/db.js";

import {
    generateMessagePublicId
} from "../utils/idGenerator.js";

/*
|--------------------------------------------------------------------------
| Message Repository
|--------------------------------------------------------------------------
|
| Database access layer for messages.
|
| Responsibilities:
|
| • Message persistence
| • Chat membership queries
| • Message retrieval
| • Message updates
| • Soft deletion
|
| This repository NEVER:
|
| ✗ Performs validation
| ✗ Checks permissions
| ✗ Applies business rules
| ✗ Starts or commits transactions
|
| Those responsibilities belong to the Service Layer.
|
*/




/*
|--------------------------------------------------------------------------
| Find Message By Public ID
|--------------------------------------------------------------------------
|
| Returns a single message.
|
| Future usage:
|
| • Edit
| • Delete
| • Reply
| • Forward
| • Reactions
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
| Create Message
|--------------------------------------------------------------------------
|
| Inserts a new message.
|
| IMPORTANT:
| • Must be executed inside an active transaction.
| • Transaction lifecycle is managed by the Service Layer.
|
| Future-ready:
|
| • Attachments
| • Replies
| • Forwarded Messages
| • Voice Notes
| • Polls
| • Scheduled Messages
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

    const result = await client.query(

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
| Returns paginated messages ordered chronologically.
|
| Supports:
|
| ✓ Infinite scrolling
| ✓ Sender information
| ✓ Edited messages
| ✓ Soft deleted messages
| ✓ Future attachments
| ✓ Replies
| ✓ Reactions
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

            ------------------------------------------------------
            -- Message
            ------------------------------------------------------

            m.id,

            m.public_id,

            m.chat_id,

            m.sender_id,

            m.text,

            m.message_type,

            m.metadata,

            m.is_edited,

            m.is_deleted,

            m.created_at,

            m.updated_at,

            ------------------------------------------------------
            -- Sender
            ------------------------------------------------------

            u.public_id
                AS sender_public_id,

            u.username,

            u.display_name,

            u.avatar_url
                AS sender_avatar,

            ------------------------------------------------------
            -- Sender Role
            ------------------------------------------------------

            member.role
                AS sender_role

        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        INNER JOIN users u

            ON u.id = m.sender_id

        INNER JOIN LATERAL (

            SELECT

                role

            FROM chat_members

            WHERE

                chat_id = c.id

            AND

                user_id = m.sender_id

            LIMIT 1

        ) member

            ON TRUE

        WHERE

            c.public_id = $1

        AND

            EXISTS (

                SELECT 1

                FROM chat_members cm

                WHERE

                    cm.chat_id = c.id

                AND

                    cm.user_id = $2

            )

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
    Convert newest-first query into chronological order.
    ------------------------------------------------------------
    */

    return result.rows.reverse();

}
/*
|--------------------------------------------------------------------------
| Update Message
|--------------------------------------------------------------------------
|
| Updates an existing message.
|
| IMPORTANT:
| • Must be executed inside an active transaction.
| • Does NOT perform authorization checks.
| • Authorization belongs to the Service Layer.
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
| Soft deletes a message.
|
| The row is preserved to maintain:
|
| • Conversation history
| • Replies
| • Read receipts
| • Audit integrity
|
| IMPORTANT:
| • Must be executed inside an active transaction.
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
| Get Latest Chat Message
|--------------------------------------------------------------------------
|
| Returns the newest non-deleted message for a chat.
|
| Used for:
|
| • Chat list preview
| • Last message
| • Future notifications
|
*/

export async function getLatestChatMessage(

    chatId

) {

    const result = await query(

        `
        SELECT

            id,

            public_id,

            sender_id,

            text,

            message_type,

            created_at

        FROM messages

        WHERE

            chat_id = $1

        AND

            is_deleted = FALSE

        ORDER BY

            created_at DESC

        LIMIT 1;
        `,

        [

            chatId

        ]

    );

    return result.rows[0] ?? null;

}


/*
|--------------------------------------------------------------------------
| Count Chat Messages
|--------------------------------------------------------------------------
|
| Returns the total number of visible messages
| inside a chat.
|
| Future Uses:
|
| • Statistics
| • Pagination
| • Admin Dashboard
|
*/

export async function countChatMessages(

    chatId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER AS total

        FROM messages

        WHERE

            chat_id = $1

        AND

            is_deleted = FALSE;
        `,

        [

            chatId

        ]

    );

    return result.rows[0].total;

}
/*
|--------------------------------------------------------------------------
| Count Unread Messages
|--------------------------------------------------------------------------
|
| Returns the number of unread messages for a user in a chat.
|
| NOTE:
| This implementation assumes a future
| message_reads table.
|
| Repository kept ready for future migration.
|
*/

export async function countUnreadMessages(

    chatId,

    userId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER AS unread_count

        FROM messages m

        WHERE

            m.chat_id = $1

        AND

            m.sender_id <> $2

        AND

            m.is_deleted = FALSE

        AND NOT EXISTS (

            SELECT 1

            FROM message_reads mr

            WHERE

                mr.message_id = m.id

            AND

                mr.user_id = $2

        );
        `,

        [

            chatId,

            userId

        ]

    );

    return result.rows[0]?.unread_count ?? 0;

}


/*
|--------------------------------------------------------------------------
| Find Messages By Public IDs
|--------------------------------------------------------------------------
|
| Bulk lookup.
|
| Future Uses:
|
| • Forward Messages
| • Bulk Delete
| • Bulk Reactions
| • Export Chats
|
*/

export async function findMessagesByPublicIds(

    publicIds = []

) {

    if (publicIds.length === 0) {

        return [];

    }

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

            public_id = ANY($1);
        `,

        [

            publicIds

        ]

    );

    return result.rows;

}


/*
|--------------------------------------------------------------------------
| Find Chat Messages After Timestamp
|--------------------------------------------------------------------------
|
| Used for:
|
| • Incremental Sync
| • Multi-device Sync
| • Offline Synchronization
|
*/

export async function getMessagesAfter(

    chatId,

    timestamp

) {

    const result = await query(

        `
        SELECT

            id,

            public_id,

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

            chat_id = $1

        AND

            created_at > $2

        ORDER BY

            created_at ASC;
        `,

        [

            chatId,

            timestamp

        ]

    );

    return result.rows;

}


/*
|--------------------------------------------------------------------------
| Repository Summary
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Chat Membership Lookup
| ✓ Message Persistence
| ✓ Paginated Retrieval
| ✓ Edit Messages
| ✓ Soft Delete
| ✓ Latest Message
| ✓ Message Statistics
| ✓ Bulk Lookup
| ✓ Incremental Sync
|
| Future Ready
|
| ✓ Attachments
| ✓ Replies
| ✓ Reactions
| ✓ Forwarding
| ✓ Pins
| ✓ Polls
| ✓ Voice Notes
| ✓ Scheduled Messages
| ✓ Threads
| ✓ Read Receipts
| ✓ Unread Counts
| ✓ Multi-device Sync
|
| IMPORTANT
|
| This repository intentionally contains
| ONLY SQL queries.
|
| Validation
| Authorization
| Transactions
| Business Rules
|
| belong exclusively inside
| Message Service.
|--------------------------------------------------------------------------
*/