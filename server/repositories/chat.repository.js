import {
    query
} from "../config/db.js";

import {
    generateChatPublicId
} from "../utils/idGenerator.js";

/*
|--------------------------------------------------------------------------
| Find Users
|--------------------------------------------------------------------------
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
        WHERE public_id = $1
          AND deleted_at IS NULL
        LIMIT 1;
        `,
        [publicId]
    );

    return result.rows[0] ?? null;
}

/*
|--------------------------------------------------------------------------
| Private Chats
|--------------------------------------------------------------------------
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
            c.chat_type,
            c.title,
            c.created_at
        FROM chats c
        INNER JOIN chat_members cm
            ON cm.chat_id = c.id
        WHERE
            c.chat_type = 'private'
            AND cm.left_at IS NULL
            AND cm.banned_at IS NULL
        GROUP BY
            c.id
        HAVING
            COUNT(*) = 2
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
| Create Private Chat
|--------------------------------------------------------------------------
|
| Creates a brand-new private chat.
|
| This function assumes a transaction has already been started.
|
*/

export async function createPrivateChat(
  client,
  user1Id,
  user2Id
) {
    const publicId = generateChatPublicId();

    const chatResult = await client.query(
        `
        INSERT INTO chats (
            public_id,
            chat_type
        )
        VALUES (
            $1,
            'private'
        )
        RETURNING
            id,
            public_id,
            chat_type,
            created_at;
        `,
        [publicId]
    );

    const chat = chatResult.rows[0];

    await client.query(
        `
        INSERT INTO chat_members (
            chat_id,
            user_id,
            role
        )
        VALUES
            ($1, $2, 'member'),
            ($1, $3, 'member');
        `,
        [
            chat.id,
            user1Id,
            user2Id
        ]
    );

    return {
        chatId: chat.id,
        publicId: chat.public_id,
        type: chat.chat_type,
        createdAt: chat.created_at
    };

}
/*
|--------------------------------------------------------------------------
| Add Chat Member
|--------------------------------------------------------------------------
|
| Adds a user to a chat.
|
| Must be called inside an active database transaction.
|
*/

export async function addChatMember(
  client,
   {
        chatId,
        userId,
        role = "member",
        invitedBy = null,
        invitationType = "user",
        createdBy = null
    }
) {
   const result = await client.query(
        `
        INSERT INTO chat_members (
            chat_id,
            user_id,
            role,
            invited_by,
            invitation_type,
            created_by,
            updated_by
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $6
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
            invitedBy,
            invitationType,
            createdBy
        ]
    );

    return result.rows[0] ?? null;

}
/*
|--------------------------------------------------------------------------
| Get User Chats
|--------------------------------------------------------------------------
|
| Returns every chat the user currently belongs to.
|
| Ordered by most recent activity.
|
*/

export async function getUserChats(
    userId
) {

    const result = await query(

        `
        SELECT
            c.id,
            c.public_id,
            c.type,
            c.title,
            c.avatar_url,
            c.created_at,
            c.updated_at
        FROM chats c
        INNER JOIN chat_members cm
            ON cm.chat_id = c.id
        WHERE
            cm.user_id = $1
        ORDER BY
            c.updated_at DESC;
        `,

        [
            userId
        ]

    );

    return result.rows;

}