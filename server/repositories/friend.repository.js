import db from "../config/db.js";

export async function findUserByPublicId(publicId) {
  const result = await db.query(
    `
    SELECT
      id,
      public_id,
      username,
      display_name
    FROM users
    WHERE public_id = $1
    LIMIT 1
    `,
    [publicId]
  );

  return result.rows[0] ?? null;
}
export async function findFriendship(
  userId1,
  userId2
) {
  const result = await db.query(
    `
    SELECT *
    FROM friendships
    WHERE
      (requester_id = $1 AND addressee_id = $2)
      OR
      (requester_id = $2 AND addressee_id = $1)
    LIMIT 1
    `,
    [userId1, userId2]
  );

  return result.rows[0] ?? null;
}
export async function createFriendRequest(
  requesterId,
  addresseeId
) {
  const result = await db.query(
    `
    INSERT INTO friendships (
      requester_id,
      addressee_id,
      status
    )
    VALUES ($1, $2, 'pending')
    RETURNING *
    `,
    [requesterId, addresseeId]
  );

  return result.rows[0];
}