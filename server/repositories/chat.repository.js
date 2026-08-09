import { query } from "../config/db.js";

/*
|--------------------------------------------------------------------------
| Chat Repository
|--------------------------------------------------------------------------
|
| Handles all database operations related to chats and memberships.
|
| Responsibilities
| • User lookups
| • Chat lookups
| • Membership management
| • Chat creation
| • Chat statistics
|
| This layer NEVER contains business logic.
|
*/

/*
|--------------------------------------------------------------------------
| Find User By Public ID
|--------------------------------------------------------------------------
|
| Returns a user if they exist and are not soft deleted.
|
*/

export async function findUserByPublicId(publicId) {
    const result = await query(
        `
        SELECT
            id,
            public_id,
            username,
            display_name,
            avatar
        FROM users
        WHERE
            public_id = $1
            AND deleted_at IS NULL
        LIMIT 1;
        `,
        [publicId]
    );

    return result.rows[0] ?? null;
}

/*
|--------------------------------------------------------------------------
| Find Chat By Internal ID
|--------------------------------------------------------------------------
|
| Used internally by services.
|
*/

export async function findChatById(chatId) {
    const result = await query(
        `
        SELECT
            id,
            public_id,
            chat_type,
            title,
            description,
            photo,
            owner_id,
            visibility,
            member_count,
            message_count,
            created_at,
            updated_at
        FROM chats
        WHERE
            id = $1
            AND deleted_at IS NULL
        LIMIT 1;
        `,
        [chatId]
    );

    return result.rows[0] ?? null;
}

/*
|--------------------------------------------------------------------------
| Find Chat By Public ID
|--------------------------------------------------------------------------
|
| Returns one chat using its public identifier.
|
*/

export async function findChatByPublicId(publicId) {
    const result = await query(
        `
        SELECT
            id,
            public_id,
            chat_type,
            title,
            description,
            photo,
            owner_id,
            visibility,
            member_count,
            message_count,
            created_at,
            updated_at
        FROM chats
        WHERE
            public_id = $1
            AND deleted_at IS NULL
        LIMIT 1;
        `,
        [publicId]
    );

    return result.rows[0] ?? null;
}

/*
|--------------------------------------------------------------------------
| Find Existing Private Chat
|--------------------------------------------------------------------------
|
| Returns an existing private chat shared by exactly two active members.
|
*/

export async function findPrivateChat(userId1, userId2) {
    const result = await query(
        `
        SELECT
            c.id,
            c.public_id,
            c.chat_type,
            c.title,
            c.photo,
            c.created_at,
            c.updated_at
        FROM chats c
        INNER JOIN chat_members cm
            ON cm.chat_id = c.id
        WHERE
            c.chat_type = 'private'
            AND c.deleted_at IS NULL
            AND cm.left_at IS NULL
            AND cm.banned_at IS NULL
        GROUP BY
            c.id,
            c.public_id,
            c.chat_type,
            c.title,
            c.photo,
            c.created_at,
            c.updated_at
        HAVING
            COUNT(cm.user_id) = 2
            AND COUNT(*) FILTER (
                WHERE cm.user_id IN ($1, $2)
            ) = 2
        LIMIT 1;
        `,
        [userId1, userId2]
    );

    return result.rows[0] ?? null;
}
/*
|--------------------------------------------------------------------------
| Find Chat Member
|--------------------------------------------------------------------------
|
| Returns one active membership.
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
            joined_at,
            left_at,
            banned_at,
            unread_count,
            notification_level,
            muted_until,
            pinned,
            archived
        FROM chat_members
        WHERE
            chat_id = $1
            AND user_id = $2
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
| Find Chat Members
|--------------------------------------------------------------------------
|
| Returns all active members of a chat.
|
*/

export async function findChatMembers(
    chatId
) {
    const result = await query(
        `
        SELECT
            cm.id,
            cm.chat_id,
            cm.user_id,
            cm.role,
            cm.joined_at,

            u.public_id,
            u.username,
            u.display_name,
            u.avatar

        FROM chat_members cm

        INNER JOIN users u
            ON u.id = cm.user_id

        WHERE
            cm.chat_id = $1
            AND cm.left_at IS NULL
            AND cm.banned_at IS NULL
            AND u.deleted_at IS NULL

        ORDER BY
            cm.joined_at ASC;
        `,
        [
            chatId
        ]
    );

    return result.rows;
}

/*
|--------------------------------------------------------------------------
| Add Chat Member
|--------------------------------------------------------------------------
|
| Safe to call multiple times.
|
*/

export async function addChatMember(
    client,
    {
        chatId,
        userId,
        role = "member",
        invitedBy = null
    }
) {
    const result = await client.query(
        `
        INSERT INTO chat_members (

            chat_id,
            user_id,
            role,
            invited_by

        )

        VALUES (

            $1,
            $2,
            $3,
            $4

        )

        ON CONFLICT (chat_id, user_id)

        DO NOTHING

        RETURNING

            id,
            chat_id,
            user_id,
            role,
            joined_at;
        `,
        [
            chatId,
            userId,
            role,
            invitedBy
        ]
    );

    return result.rows[0] ?? null;
}

/*
|--------------------------------------------------------------------------
| Remove Chat Member
|--------------------------------------------------------------------------
|
|
| Soft-leaves a member from a chat.
|
*/

export async function removeChatMember(
    client,
    chatId,
    userId
) {
    const result = await client.query(
        `
        UPDATE chat_members

        SET

            left_at = NOW(),
            updated_at = NOW()

        WHERE

            chat_id = $1
            AND user_id = $2
            AND left_at IS NULL

        RETURNING
            id;
        `,
        [
            chatId,
            userId
        ]
    );

    return result.rowCount > 0;
}

/*
|--------------------------------------------------------------------------
| Update Member Role
|--------------------------------------------------------------------------
|
| Promotes or demotes a member.
|
*/

export async function updateMemberRole(
    client,
    chatId,
    userId,
    role
) {
    const result = await client.query(
        `
        UPDATE chat_members

        SET

            role = $3,
            updated_at = NOW()

        WHERE

            chat_id = $1
            AND user_id = $2

        RETURNING

            id,
            role,
            updated_at;
        `,
        [
            chatId,
            userId,
            role
        ]
    );

    return result.rows[0] ?? null;
}
/*
|--------------------------------------------------------------------------
| Create Private Chat
|--------------------------------------------------------------------------
|
| Creates a new private conversation.
|
| Members are added separately inside the same transaction.
|
*/

export async function createPrivateChat(
    client,
    ownerId
) {
    const result = await client.query(
        `
        INSERT INTO chats (

            chat_type,
            owner_id

        )

        VALUES (

            'private',
            $1

        )

        RETURNING

            id,
            public_id,
            chat_type,
            title,
            description,
            photo,
            owner_id,
            visibility,
            member_count,
            message_count,
            created_at,
            updated_at;
        `,
        [
            ownerId
        ]
    );

    return result.rows[0];
}

/*
|--------------------------------------------------------------------------
| Create Group Chat
|--------------------------------------------------------------------------
|
| Creates a new group.
|
*/

export async function createGroupChat(
    client,
    {
        ownerId,
        title,
        description = null,
        photo = null,
        visibility = "private"
    }
) {
    const result = await client.query(
        `
        INSERT INTO chats (

            chat_type,
            title,
            description,
            photo,
            visibility,
            owner_id

        )

        VALUES (

            'group',
            $1,
            $2,
            $3,
            $4,
            $5

        )

        RETURNING

            id,
            public_id,
            chat_type,
            title,
            description,
            photo,
            owner_id,
            visibility,
            member_count,
            message_count,
            created_at,
            updated_at;
        `,
        [
            title,
            description,
            photo,
            visibility,
            ownerId
        ]
    );

    return result.rows[0];
}

/*
|--------------------------------------------------------------------------
| Get User Chats
|--------------------------------------------------------------------------
|
| Returns every chat the user belongs to.
|
| Future Ready:
|
| ✓ Private Chats
| ✓ Groups
| ✓ Channels
| ✓ Member Count
| ✓ Message Count
| ✓ Last Message
| ✓ Unread Count
| ✓ Pinned Chats
| ✓ Archived Chats
|
*/

export async function getUserChats(
    userId
) {
    const result = await query(
        `
        SELECT

            ----------------------------------------------------------
            -- Chat
            ----------------------------------------------------------

            c.id,
            c.public_id,
            c.chat_type,
            c.title,
            c.description,
            c.photo,
            c.visibility,
            c.member_count,
            c.message_count,
            c.created_at,
            c.updated_at,

            ----------------------------------------------------------
            -- Membership
            ----------------------------------------------------------

            cm.role,
            cm.unread_count,
            cm.notification_level,
            cm.muted_until,
            cm.pinned,
            cm.archived,
            cm.last_read_message_id,

            ----------------------------------------------------------
            -- Other User (Private Chats)
            ----------------------------------------------------------

            other_user.public_id AS other_user_public_id,
            other_user.username AS other_username,
            other_user.display_name AS other_display_name,
            other_user.avatar AS other_avatar

        FROM chats c

        INNER JOIN chat_members cm

            ON cm.chat_id = c.id

        LEFT JOIN LATERAL (

            SELECT

                u.public_id,
                u.username,
                u.display_name,
                u.avatar

            FROM chat_members cm2

            INNER JOIN users u

                ON u.id = cm2.user_id

            WHERE

                cm2.chat_id = c.id

                AND cm2.user_id <> $1

                AND cm2.left_at IS NULL

                AND cm2.banned_at IS NULL

            LIMIT 1

        ) AS other_user

            ON c.chat_type = 'private'

        WHERE

            cm.user_id = $1

            AND cm.left_at IS NULL

            AND cm.banned_at IS NULL

            AND c.deleted_at IS NULL

        ORDER BY

            cm.pinned DESC,

            c.updated_at DESC,

            c.created_at DESC;
        `,
        [
            userId
        ]
    );

    return result.rows;
}

/*
|--------------------------------------------------------------------------
| Update Chat Counters
|--------------------------------------------------------------------------
|
| Keeps cached counters synchronized.
|
| Called after:
|
| • Send Message
| • Delete Message
| • Join Chat
| • Leave Chat
|
*/

export async function updateChatCounters(
    client,
    chatId
) {
    await client.query(
        `
        UPDATE chats

        SET

            member_count = (

                SELECT COUNT(*)

                FROM chat_members

                WHERE

                    chat_id = $1

                    AND left_at IS NULL

                    AND banned_at IS NULL

            ),

            message_count = (

                SELECT COUNT(*)

                FROM messages

                WHERE

                    chat_id = $1

                    AND deleted_at IS NULL

            ),

            updated_at = NOW()

        WHERE

            id = $1;
        `,
        [
            chatId
        ]
    );
}