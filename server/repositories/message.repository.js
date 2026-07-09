import { query } from "../config/db.js";

export async function createMessage(
  chatId,
  sender,
  text
) {
  const result = await query(
    `
    INSERT INTO messages
    (
       chat_id,
       sender_id,
       text
    )
    VALUES ($1,$2,$3)
    RETURNING *
    `,
    [  
       chatId,
       sender,
       text
    ]
  );

  return result.rows[0];
}

export async function getMessages(
  chatId
) {
  const result = await query(
    `
    SELECT *
    FROM messages
    WHERE chat_id=$1
    ORDER BY created_at ASC
    `,
    [chatId]
  );

  return result.rows;
}
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
        m.created_at,
    
        u.public_id AS sender_public_id,
        u.username,
        u.display_name,
        u.avatar_url

    FROM messages m

    INNER JOIN chats c
        ON c.id = m.chat_id

    INNER JOIN users u
        ON u.id = m.sender_id

    INNER JOIN chat_members cm
        ON cm.chat_id = c.id

    WHERE
        c.public_id = $1
    AND
        cm.user_id = $2
    AND
    (
        $3::timestamp IS NULL
        OR
        m.created_at < $3
    )

    ORDER BY m.created_at DESC
    LIMIT $4;
    `,
    [
        chatPublicId,
        userId,
        before,
        limit
    ]
    );

    return result.rows.reverse();
}