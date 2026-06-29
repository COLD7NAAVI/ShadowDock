import pool from "../config/db.js";

export async function createMessage(
  chatId,
  sender,
  text
) {
  const result = await pool.query(
    `
    INSERT INTO messages
    (chat_id, sender, text)
    VALUES ($1,$2,$3)
    RETURNING *
    `,
    [chatId, sender, text]
  );

  return result.rows[0];
}

export async function getMessages(
  chatId
) {
  const result = await pool.query(
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