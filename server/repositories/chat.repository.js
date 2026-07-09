import {
    query
} from "../config/db.js";

import {
    generateChatPublicId
} from "../utils/idGenerator.js";

/*
|--------------------------------------------------------------------------
| Find User By Public ID
|--------------------------------------------------------------------------
|
| Returns a user if they exist and are not soft-deleted.
|
*/

export async function findUserByPublicId(
    publicId
) {

    const result = await query(

        `
        SELECT
            id,
            public_id,
            username,
            display_name
        FROM users
        WHERE
            public_id = $1
            AND deleted_at IS NULL
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
| Find Existing Private Chat
|--------------------------------------------------------------------------
|
| Returns an existing private chat shared by exactly two users.
|
*/

export async function findPrivateChat(
    userId1,
    userId2
) {

    const result = await query(

        `
        SELECT
            c.id,
            c.public_id,
            c.type,
            c.name,
            c.avatar_url,
            c.created_at,
            c.updated_at
        FROM chats c
        INNER JOIN chat_members cm
            ON cm.chat_id = c.id
        WHERE
            c.type = 'private'
        GROUP BY
            c.id,
            c.public_id,
            c.type,
            c.name,
            c.avatar_url,
            c.created_at,
            c.updated_at
        HAVING
            COUNT(*) = 2
            AND COUNT(*) FILTER (
                WHERE cm.user_id IN ($1, $2)
            ) = 2
        LIMIT 1;
        `,

        [
            userId1,
            userId2
        ]

    );

    return result.rows[0] ?? null;

}
/*
|--------------------------------------------------------------------------
| Create Private Chat
|--------------------------------------------------------------------------
|
| Creates a new private chat.
|
| NOTE:
| Members are NOT inserted here.
| The service layer is responsible for adding members so the
| entire operation stays inside one transaction.
|
*/

export async function createPrivateChat(
    client,
    user1Id
    ) {

    const publicId = generateChatPublicId();

    const result = await client.query(

        `
        INSERT INTO chats (

            public_id,
            type,
            created_by

        )

        VALUES (

            $1,
            'private',
            $2

        )

        RETURNING

            id,
            public_id,
            type,
            name,
            avatar_url,
            created_at,
            updated_at;

        `,

        [

            publicId,
            user1Id

        ]

    );

    const chat = result.rows[0];

    return {

        chatId: chat.id,

        publicId: chat.public_id,

        type: chat.type,

        name: chat.name,

        avatarUrl: chat.avatar_url,

        createdAt: chat.created_at,

        updatedAt: chat.updated_at

    };

}

/*
|--------------------------------------------------------------------------
| Add Chat Member
|--------------------------------------------------------------------------
|
| Adds a single user to a chat.
|
| Safe to call multiple times because of
| ON CONFLICT (chat_id, user_id).
|
*/

export async function addChatMember(

    client,

    {

        chatId,

        userId,

        role = "member"

    }

) {

    const result = await client.query(

        `
        INSERT INTO chat_members (

            chat_id,
            user_id,
            role

        )

        VALUES (

            $1,
            $2,
            $3

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
            role

        ]

    );

    return result.rows[0] ?? null;

}
/*
|--------------------------------------------------------------------------
| Get User Chats
|--------------------------------------------------------------------------
|
| Returns every chat the authenticated user belongs to.
|
| Private chats automatically expose the OTHER participant's
| information so the frontend can render the conversation directly.
|
| Groups and channels keep their own name/avatar.
|
| Future-ready for:
| • Last message preview
| • Unread count
| • Typing indicator
| • Online status
| • Pinned chats
|
*/

export async function getUserChats(
    userId
) {

    const result = await query(

        `
        SELECT

            ----------------------------------------------------------
            -- Chat Information
            ----------------------------------------------------------

            c.id,

            c.public_id,

            c.type,

            c.created_at,

            c.updated_at,

            ----------------------------------------------------------
            -- Current User Role
            ----------------------------------------------------------

            cm.role,

            ----------------------------------------------------------
            -- Total Members
            ----------------------------------------------------------

            member_counts.member_count,

            ----------------------------------------------------------
            -- Display Name
            ----------------------------------------------------------

            CASE

                WHEN c.type = 'private'

                THEN other_user.display_name

                ELSE c.name

            END AS display_name,

            ----------------------------------------------------------
            -- Display Avatar
            ----------------------------------------------------------

            CASE

                WHEN c.type = 'private'

                THEN other_user.avatar_url

                ELSE c.avatar_url

            END AS display_avatar,

            ----------------------------------------------------------
            -- Other User (Private Chats)
            ----------------------------------------------------------

            other_user.public_id AS user_public_id,

            other_user.username,

            other_user.display_name AS user_display_name,

            other_user.avatar_url AS user_avatar

        FROM chats c

        ----------------------------------------------------------
        -- Membership
        ----------------------------------------------------------

        INNER JOIN chat_members cm

            ON cm.chat_id = c.id

        ----------------------------------------------------------
        -- Member Count
        ----------------------------------------------------------

        LEFT JOIN (

            SELECT

                chat_id,

                COUNT(*)::INTEGER AS member_count

            FROM chat_members

            GROUP BY chat_id

        ) member_counts

            ON member_counts.chat_id = c.id

        ----------------------------------------------------------
        -- Other User
        ----------------------------------------------------------

        LEFT JOIN LATERAL (

            SELECT

                u.public_id,

                u.username,

                u.display_name,

                u.avatar_url

            FROM chat_members cm2

            INNER JOIN users u

                ON u.id = cm2.user_id

            WHERE

                cm2.chat_id = c.id

                AND cm2.user_id <> $1

            LIMIT 1

        ) other_user

            ON c.type = 'private'

        ----------------------------------------------------------
        -- Chats this user belongs to
        ----------------------------------------------------------

        WHERE

            cm.user_id = $1

        ----------------------------------------------------------
        -- Newest First
        ----------------------------------------------------------

        ORDER BY

            c.updated_at DESC,

            c.created_at DESC;

        `,

        [

            userId

        ]

    );

    return result.rows;

}