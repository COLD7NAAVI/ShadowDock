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
export async function getIncomingRequests(
  userId
) {
  const result = await db.query(
    `
    SELECT
      f.id,
      u.public_id,
      u.username,
      u.display_name,
      f.created_at
    FROM friendships f
    JOIN users u
      ON u.id = f.requester_id
    WHERE
      f.addressee_id = $1
      AND f.status = 'pending'
    ORDER BY f.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function getOutgoingRequests(
  userId
) {
  const result = await db.query(
    `
    SELECT
      f.id,
      u.public_id,
      u.username,
      u.display_name,
      f.created_at
    FROM friendships f
    JOIN users u
      ON u.id = f.addressee_id
    WHERE
      f.requester_id = $1
      AND f.status = 'pending'
    ORDER BY f.created_at DESC
    `,
    [userId]
  );

  return result.rows;
}
export async function findPendingRequest(
  requesterId,
  addresseeId
) {
  const result = await db.query(
    `
    SELECT *
    FROM friendships
    WHERE
      requester_id = $1
      AND addressee_id = $2
      AND status = 'pending'
    LIMIT 1
    `,
    [requesterId, addresseeId]
  );

  return result.rows[0] ?? null;
}

export async function acceptFriendRequest(
  requesterId,
  addresseeId
) {
  const result = await db.query(
    `
    UPDATE friendships
    SET
      status = 'accepted'
    WHERE
      requester_id = $1
      AND addressee_id = $2
      AND status = 'pending'
    RETURNING *
    `,
    [requesterId, addresseeId]
  );

  return result.rows[0] ?? null;
}

export async function rejectFriendRequest(
  requesterId,
  addresseeId
) {
  const result = await db.query(
    `
    DELETE FROM friendships
    WHERE requester_id = $1
      AND addressee_id = $2
      AND status = 'pending'
    RETURNING *;
    `,
    [requesterId, addresseeId]
  );

  return result.rows[0] ?? null;
}

export async function getFriends(userId) {
  const result = await db.query(
    `
    SELECT
      u.public_id,
      u.username,
      u.display_name,
      f.created_at AS friends_since
    FROM friendships f
    JOIN users u
      ON (
        (f.requester_id = $1 AND u.id = f.addressee_id)
        OR
        (f.addressee_id = $1 AND u.id = f.requester_id)
      )
    WHERE
      f.status = 'accepted'
    ORDER BY
      u.username ASC
    `,
    [userId]
  );

  return result.rows;
}