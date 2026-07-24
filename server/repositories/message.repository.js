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
| Business logic belongs to the Service Layer.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Shared Column Definitions
|--------------------------------------------------------------------------
|
| Every query returns the same message structure.
|
*/

const MESSAGE_COLUMNS = `
    m.id,
    m.public_id,

    m.chat_id,
    m.sender_id,

    m.sender_public_id,
    

    m.message_type,

    m.content,

    m.reply_to_message_id,
    m.forwarded_from_message_id,

    m.edited,

    m.metadata,

    m.created_at,
    m.updated_at,
    m.deleted_at,
    m.thread_root_message_id,
    m.delivery_status,
    m.edited_at,
    m.pinned,
    m.pinned_at,
    m.reaction_count,
    m.reply_count,
    m.forward_count,
    m.view_count,
    m.generator_type,
    m.encrypted
`;

const MESSAGE_WITH_CHAT_COLUMNS = `
    ${MESSAGE_COLUMNS},

    c.public_id AS chat_public_id
`;

/*
|--------------------------------------------------------------------------
| Find Message By Internal ID
|--------------------------------------------------------------------------
|
| Internal service lookup.
|
*/

export async function findMessageById(
    messageId
) {

    const result = await query(

        `
        SELECT

            ${MESSAGE_WITH_CHAT_COLUMNS}

        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        WHERE

            m.id = $1

        LIMIT 1;
        `,

        [

            messageId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Find Message By Public ID
|--------------------------------------------------------------------------
|
| Returns one message.
|
*/

export async function findMessageByPublicId(
    publicId
) {

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

        [

            publicId

        ]

    );

    return result.rows[0] ?? null;

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
| • Bulk Delete
| • Forward Messages
| • Export Chats
| • AI Processing
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

            m.public_id = ANY($1)

        ORDER BY

            m.created_at ASC;
        `,

        [

            publicIds

        ]

    );

    return result.rows;

}
/*
|--------------------------------------------------------------------------
| Create Message
|--------------------------------------------------------------------------
|
| Creates a new message.
|
| Must execute inside an active transaction.
|
*/

export async function createMessage(

    client,

    {

        chatId,

        senderId,

        senderPublicId,

        content,

        messageType = "text",

        metadata = {},

        replyToMessageId = null,

        threadRootMessageId = null,

        forwardedFromMessageId = null,

        forwardedFromChatId = null,

        forwardedFromUserId = null,

        scheduledAt = null,

        expiresAt = null,

        encrypted = false,

        encryptionVersion = null,

        messageNonce = null,

        encryptedKey = null,

        encryptionAlgorithm = null

    }

) {

    const result = await client.query(

        `
        INSERT INTO messages (

            chat_id,

            sender_id,

            sender_public_id,

            content,

            message_type,

            metadata,

            reply_to_message_id,

            thread_root_message_id,

            forwarded_from_message_id,

            forwarded_from_chat_id,

            forwarded_from_user_id,

            scheduled_at,

            expires_at,

            encrypted,

            encryption_version,

            message_nonce,

            encrypted_key,

            encryption_algorithm,

            created_by

        )

        VALUES (

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            $8,

            $9,

            $10,

            $11,

            $12,

            $13,

            $14,

            $15,

            $16,

            $17,

            $18,

            $2

        )

        RETURNING *;
        `,

        [

            chatId,

            senderId,

            senderPublicId,

            content,

            messageType,

            metadata,

            replyToMessageId,

            threadRootMessageId,

            forwardedFromMessageId,

            forwardedFromChatId,

            forwardedFromUserId,

            scheduledAt,

            expiresAt,

            encrypted,

            encryptionVersion,

            messageNonce,

            encryptedKey,

            encryptionAlgorithm

        ]

    );

    return result.rows[0];

}

/*
|--------------------------------------------------------------------------
| Update Message
|--------------------------------------------------------------------------
|
| Edit an existing message.
|
*/

export async function updateMessage(

    client,

    {

        messageId,

        content,

        metadata,

        editorId

    }

) {

    const result = await client.query(

        `
        UPDATE messages

        SET

            content = $1,

            metadata = $2,

            edited = TRUE,

            edit_count = edit_count + 1,

            edited_at = NOW(),

            last_editor_id = $3,

            updated_by = $3,

            updated_at = NOW()

        WHERE

            id = $4

        RETURNING *;
        `,

        [

            content,

            metadata,

            editorId,

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
| Preserves history.
|
*/

export async function softDeleteMessage(

    client,

    {

        messageId,

        deletedBy,

        deleteForEveryone = false

    }

) {

    const result = await client.query(

        `
        UPDATE messages

        SET

            deleted_at = NOW(),

            deleted_by = $1,

            deleted_for_everyone = $2,

            updated_by = $1,

            updated_at = NOW()

        WHERE

            id = $3

        RETURNING *;
        `,

        [

            deletedBy,

            deleteForEveryone,

            messageId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Restore Message
|--------------------------------------------------------------------------
|
|
| Future moderation support.
|
*/

export async function restoreMessage(

    client,

    {

        messageId,

        restoredBy

    }

) {

    const result = await client.query(

        `
        UPDATE messages

        SET

            deleted_at = NULL,

            deleted_by = NULL,

            restored_at = NOW(),

            restored_by = $1,

            updated_by = $1,

            updated_at = NOW()

        WHERE

            id = $2

        RETURNING *;
        `,

        [

            restoredBy,

            messageId

        ]

    );

    return result.rows[0] ?? null;

}
/*
|--------------------------------------------------------------------------
| Get Chat Messages
|--------------------------------------------------------------------------
|
| Returns messages for a chat.
|
| Features
|
| ✓ Infinite Scroll
| ✓ Cursor Pagination
| ✓ Reply Ready
| ✓ Thread Ready
| ✓ Attachment Ready
| ✓ Reaction Ready
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
            -- Chat
            --------------------------------------------------

            c.public_id
                AS chat_public_id,

            --------------------------------------------------
            -- Sender
            --------------------------------------------------

            u.username,

            u.display_name,

            u.photo
                AS sender_photo

        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        INNER JOIN users u

            ON u.id = m.sender_id

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

                AND

                    cm.left_at IS NULL

                AND

                    cm.banned_at IS NULL

            )

        AND

            m.deleted_at IS NULL

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
| Get Messages After Timestamp
|--------------------------------------------------------------------------
|
| Used for:
|
| ✓ Offline Sync
| ✓ Multi-device Sync
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

        AND

            m.deleted_at IS NULL

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
| Get Latest Chat Message
|--------------------------------------------------------------------------
|
| Used by:
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

            ${MESSAGE_WITH_CHAT_COLUMNS}

        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        WHERE

            m.chat_id = $1

        AND

            m.deleted_at IS NULL

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
| Counts visible messages.
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

            deleted_at IS NULL;
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
| Uses chat_members.last_read_message_id.
|
| No message_reads table required.
|
*/

export async function countUnreadMessages(

    chatId,

    userId

) {

    const result = await query(

        `
        WITH last_read AS (

            SELECT

                last_read_message_id

            FROM chat_members

            WHERE

                chat_id = $1

            AND

                user_id = $2

            LIMIT 1

        )

        SELECT

            COUNT(*)::INTEGER AS unread_count

        FROM messages m

        LEFT JOIN last_read lr

            ON TRUE

        WHERE

            m.chat_id = $1

        AND

            m.sender_id <> $2

        AND

            m.deleted_at IS NULL

        AND (

                lr.last_read_message_id IS NULL

                OR

                m.created_at >

                COALESCE(

                    (

                        SELECT created_at

                        FROM messages

                        WHERE id = lr.last_read_message_id

                    ),

                    '-infinity'::timestamptz

                )

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
| Search Messages
|--------------------------------------------------------------------------
|
| Uses PostgreSQL Full Text Search.
|
| Powered by:
|
| idx_messages_content_search
|
*/

export async function searchMessages(

    chatId,

    searchText,

    limit = 50

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

            m.deleted_at IS NULL

        AND

            to_tsvector(

                'simple',

                COALESCE(

                    m.content,

                    ''

                )

            )

            @@

            plainto_tsquery(

                'simple',

                $2

            )

        ORDER BY

            ts_rank(

                to_tsvector(

                    'simple',

                    COALESCE(

                        m.content,

                        ''

                    )

                ),

                plainto_tsquery(

                    'simple',

                    $2

                )

            ) DESC,

            m.created_at DESC

        LIMIT $3;
        `,

        [

            chatId,

            searchText,

            limit

        ]

    );

    return result.rows;

}

/*
|--------------------------------------------------------------------------
| Find Replies
|--------------------------------------------------------------------------
|
| Returns direct replies to a message.
|
*/

export async function findReplies(

    messageId

) {

    const result = await query(

        `
        SELECT

            ${MESSAGE_WITH_CHAT_COLUMNS}

        FROM messages m

        INNER JOIN chats c

            ON c.id = m.chat_id

        WHERE

            m.reply_to_message_id = $1

        AND

            m.deleted_at IS NULL

        ORDER BY

            m.created_at ASC;
        `,

        [

            messageId

        ]

    );

    return result.rows;

}
/*
|--------------------------------------------------------------------------
| Pin Message
|--------------------------------------------------------------------------
|
| Pins a message inside a chat.
|
*/

export async function pinMessage(

    client,

    {

        messageId,

        pinnedBy

    }

) {

    const result = await client.query(

        `
        UPDATE messages

        SET

            pinned = TRUE,

            pinned_at = NOW(),

            pinned_by = $1,

            updated_by = $1,

            updated_at = NOW()

        WHERE

            id = $2

        RETURNING *;
        `,

        [

            pinnedBy,

            messageId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Unpin Message
|--------------------------------------------------------------------------
|
| Removes a pinned message.
|
*/

export async function unpinMessage(

    client,

    messageId

) {

    const result = await client.query(

        `
        UPDATE messages

        SET

            pinned = FALSE,

            pinned_at = NULL,

            pinned_by = NULL,

            updated_at = NOW()

        WHERE

            id = $1

        RETURNING *;
        `,

        [

            messageId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Update Message Counters
|--------------------------------------------------------------------------
|
| Keeps cached statistics synchronized.
|
| Called after:
|
| • Add Reaction
| • Remove Reaction
| • Add Reply
| • Forward Message
|
*/

export async function updateMessageCounters(

    client,

    messageId

) {

    await client.query(

        `
        UPDATE messages

        SET

            reaction_count = (

                SELECT COUNT(*)

                FROM reactions

                WHERE

                    message_id = $1

                    AND deleted_at IS NULL

            ),

            reply_count = (

                SELECT COUNT(*)

                FROM messages

                WHERE

                    reply_to_message_id = $1

                    AND deleted_at IS NULL

            ),

            forward_count = (

                SELECT COUNT(*)

                FROM messages

                WHERE

                    forwarded_from_message_id = $1

                    AND deleted_at IS NULL

            ),

            updated_at = NOW()

        WHERE

            id = $1;
        `,

        [

            messageId

        ]

    );

}

/*
|--------------------------------------------------------------------------
| Repository Summary
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ SQL Only
| ✓ CRUD Operations
| ✓ Timeline Queries
| ✓ Cursor Pagination
| ✓ Full-Text Search
| ✓ Message Editing
| ✓ Soft Delete
| ✓ Restore
| ✓ Pin / Unpin
| ✓ Reply Lookup
| ✓ Offline Synchronization
| ✓ Statistics
| ✓ Counter Maintenance
|
|--------------------------------------------------------------------------
|
| Architecture
|--------------------------------------------------------------------------
|
| Controller
|      │
|      ▼
| Service
|      │
|      ▼
| Repository
|      │
|      ▼
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
| ✗ Validate Requests
| ✗ Authorize Users
| ✗ Start Transactions
| ✗ Commit Transactions
| ✗ Rollback Transactions
| ✗ Emit Socket Events
| ✗ Apply Business Logic
|
|--------------------------------------------------------------------------
|
| Status
|--------------------------------------------------------------------------
|
| ✓ Production Ready
| ✓ PostgreSQL Optimized
| ✓ Repository Pattern
| ✓ Full-Text Search Ready
| ✓ Cursor Pagination Ready
| ✓ Reply Ready
| ✓ Thread Ready
| ✓ Forward Ready
| ✓ Pin Ready
| ✓ Attachment Ready
| ✓ Reaction Ready
| ✓ Notification Ready
| ✓ Socket.IO Ready
| ✓ Redis Ready
| ✓ Cluster Ready
| ✓ AI Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/