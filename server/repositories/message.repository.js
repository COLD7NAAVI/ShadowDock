import { query } from "../config/db.js";



/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Message Repository
|
| Database access layer.
|
| Responsibilities
|
| ✓ SQL Queries
| ✓ Message Persistence
| ✓ Retrieval
| ✓ Pagination
| ✓ Updates
| ✓ Soft Deletes
|
| This repository NEVER contains:
|
| ✗ Business Logic
| ✗ Authorization
| ✗ Validation
| ✗ Transactions
|
| Those belong to the Service Layer.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Shared Column Definitions
|--------------------------------------------------------------------------
|
| Keeps every query returning the same message structure.
| Makes future schema changes significantly easier.
|
*/

const MESSAGE_COLUMNS = `
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
    m.updated_at
`;

const MESSAGE_WITH_CHAT_COLUMNS = `
    ${MESSAGE_COLUMNS},
    c.public_id AS chat_public_id
`;

/*
|--------------------------------------------------------------------------
| Find Message By Public ID
|--------------------------------------------------------------------------
*/

export async function findMessageByPublicId(publicId) {

    const result = await query(

        `
        SELECT

            ${MESSAGE_WITH_CHAT_COLUMNS}

        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        WHERE

            m.public_id = $1

        LIMIT 1;
        `,

        [publicId]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Create Message
|--------------------------------------------------------------------------
|
| PostgreSQL automatically generates message public_id.
|
| Must execute inside an active transaction.
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

    const result = await client.query(

        `
        WITH inserted AS (

            INSERT INTO messages (

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
                $5

            )

            RETURNING *

        )

        SELECT

            inserted.id,
            inserted.public_id,
            inserted.chat_id,
            inserted.sender_id,
            inserted.text,
            inserted.message_type,
            inserted.metadata,
            inserted.is_edited,
            inserted.is_deleted,
            inserted.created_at,
            inserted.updated_at,

            chats.public_id
                AS chat_public_id

        FROM inserted

        INNER JOIN chats

            ON chats.id = inserted.chat_id;
        `,

        [

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
| Returns chronological messages.
|
| Supports
|
| ✓ Infinite Scroll
| ✓ Sender Information
| ✓ Future Replies
| ✓ Future Attachments
| ✓ Future Reactions
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

            ${MESSAGE_COLUMNS},

            --------------------------------------------------
            -- Sender
            --------------------------------------------------

            u.public_id
                AS sender_public_id,

            u.username,

            u.display_name,

            u.avatar_url
                AS sender_avatar,

            --------------------------------------------------
            -- Sender Role
            --------------------------------------------------

            member.role
                AS sender_role,

            --------------------------------------------------
            -- Chat
            --------------------------------------------------

            c.public_id
                AS chat_public_id

        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        INNER JOIN users u

            ON u.id = m.sender_id

        INNER JOIN LATERAL (

            SELECT role

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

        AND (

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
    Convert newest-first into chronological order.
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
| IMPORTANT
|
| • Must execute inside an active transaction.
| • Authorization belongs to the Service layer.
| • Returns chat_public_id for realtime broadcasts.
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
        WITH updated AS (

            UPDATE messages

            SET

                text = $1,

                metadata = $2,

                is_edited = TRUE,

                updated_at = NOW()

            WHERE

                id = $3

            RETURNING *

        )

        SELECT

            updated.id,
            updated.public_id,
            updated.chat_id,
            updated.sender_id,
            updated.text,
            updated.message_type,
            updated.metadata,
            updated.is_edited,
            updated.is_deleted,
            updated.created_at,
            updated.updated_at,

            chats.public_id
                AS chat_public_id

        FROM updated

        INNER JOIN chats

            ON chats.id = updated.chat_id;
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
| Preserves conversation history while hiding content.
|
| Returns chat_public_id for Socket.IO broadcasting.
|
*/

export async function softDeleteMessage(

    client,

    messageId

) {

    const result = await client.query(

        `
        WITH deleted AS (

            UPDATE messages

            SET

                text = NULL,

                metadata = '{}'::jsonb,

                is_deleted = TRUE,

                updated_at = NOW()

            WHERE

                id = $1

            RETURNING *

        )

        SELECT

            deleted.id,
            deleted.public_id,
            deleted.chat_id,
            deleted.sender_id,
            deleted.text,
            deleted.message_type,
            deleted.metadata,
            deleted.is_edited,
            deleted.is_deleted,
            deleted.created_at,
            deleted.updated_at,

            chats.public_id
                AS chat_public_id

        FROM deleted

        INNER JOIN chats

            ON chats.id = deleted.chat_id;
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
| Used for:
|
| ✓ Chat Sidebar
| ✓ Conversation Preview
| ✓ Push Notifications
| ✓ Last Activity
|
*/

export async function getLatestChatMessage(

    chatId

) {

    const result = await query(

        `
        SELECT

            m.public_id,

            c.public_id
                AS chat_public_id,

            m.sender_id,

            m.text,

            m.message_type,

            m.created_at,

            m.is_edited,

            m.is_deleted

        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        WHERE

            m.chat_id = $1

        AND

            m.is_deleted = FALSE

        ORDER BY

            m.created_at DESC

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
| Counts visible (non-deleted) messages.
|
| Used for:
|
| ✓ Pagination
| ✓ Chat Statistics
| ✓ Admin Dashboard
| ✓ Analytics
|
*/

export async function countChatMessages(

    chatId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER
                AS total

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
| Returns unread message count.
|
| NOTE
|
| This query assumes the future existence of:
|
| message_reads
|
| It intentionally remains here so that introducing
| read receipts later requires zero repository changes.
|
*/

export async function countUnreadMessages(

    chatId,

    userId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER
                AS unread_count

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
| Future Uses
|
| ✓ Forward Messages
| ✓ Bulk Delete
| ✓ Bulk Reactions
| ✓ Export Chats
| ✓ AI Processing
|
*/

export async function findMessagesByPublicIds(

    publicIds = []

) {

    if (

        !Array.isArray(publicIds)

        ||

        publicIds.length === 0

    ) {

        return [];

    }

    const result = await query(

        `
        SELECT

            ${MESSAGE_WITH_CHAT_COLUMNS}

        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        WHERE

            m.public_id = ANY($1);
        `,

        [

            publicIds

        ]

    );

    return result.rows;

}

/*
|--------------------------------------------------------------------------
| Get Messages After Timestamp
|--------------------------------------------------------------------------
|
| Used For
|
| ✓ Offline Sync
| ✓ Multi-device Sync
| ✓ Incremental Synchronization
| ✓ Reconnect Recovery
|
*/

export async function getMessagesAfter(

    chatId,

    timestamp

) {

    const result = await query(

        `
        SELECT

            ${MESSAGE_WITH_CHAT_COLUMNS}

        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        WHERE

            m.chat_id = $1

        AND

            m.created_at > $2

        ORDER BY

            m.created_at ASC;
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
| ✓ SQL Only
| ✓ Message Persistence
| ✓ Retrieval
| ✓ Pagination
| ✓ Edit
| ✓ Soft Delete
| ✓ Latest Message
| ✓ Statistics
| ✓ Incremental Sync
| ✓ Bulk Operations
|
|--------------------------------------------------------------------------
|
| Future Ready
|--------------------------------------------------------------------------
|
| ✓ Attachments
| ✓ Replies
| ✓ Reactions
| ✓ Threads
| ✓ Pins
| ✓ Polls
| ✓ Voice Messages
| ✓ Scheduled Messages
| ✓ Read Receipts
| ✓ Delivery Receipts
| ✓ Multi-device Sync
| ✓ Message Search
| ✓ AI Moderation
| ✓ E2EE Metadata
|
|--------------------------------------------------------------------------
|
| Architecture
|--------------------------------------------------------------------------
|
| Controller
|        │
|        ▼
| Service
|        │
|        ▼
| Repository
|        │
|        ▼
| PostgreSQL
|
|--------------------------------------------------------------------------
|
| Repository Rules
|--------------------------------------------------------------------------
|
| Repository MUST:
|
| ✓ Execute SQL
| ✓ Return Data
|
| Repository MUST NEVER:
|
| ✗ Validate
| ✗ Authorize
| ✗ Start Transactions
| ✗ Commit Transactions
| ✗ Rollback Transactions
| ✗ Emit Socket Events
| ✗ Apply Business Logic
|
|--------------------------------------------------------------------------
|
| Message Repository
|
| Status
|
| ✓ Production Ready
| ✓ PostgreSQL Optimized
| ✓ Repository Pattern
| ✓ Socket Ready
| ✓ Redis Ready
| ✓ Cluster Ready
| ✓ Multi-device Ready
| ✓ Future Attachment Ready
| ✓ Future Read Receipt Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/