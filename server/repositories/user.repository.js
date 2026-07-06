import db from "../config/db.js";

export async function getUserById(userId) {
  const result = await db.query(
    `
    SELECT
      id,
      public_id,
      username,
      display_name,
      email,
      bio,
      avatar_url,
      is_verified,
      is_online,
      last_seen,
      created_at
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0];
}

export async function getUserByPublicId(publicId) {
  const result = await db.query(
    `
    SELECT
      public_id,
      username,
      display_name,
      bio,
      avatar_url,
      is_verified,
      is_online,
      last_seen,
      created_at
    FROM users
    WHERE public_id = $1
    LIMIT 1
    `,
    [publicId]
  );

  return result.rows[0];
}

export async function updateProfile(
  userId,
  {
    display_name,
    bio,
    avatar_url,
  }
) {
  const result = await db.query(
    `
    UPDATE users
    SET
      display_name = $1,
      bio = $2,
      avatar_url = $3,
      updated_at = NOW()
    WHERE id = $4
    RETURNING
      public_id,
      username,
      display_name,
      bio,
      avatar_url,
      updated_at
    `,
    [
      display_name,
      bio,
      avatar_url,
      userId,
    ]
  );

  return result.rows[0];
}

export async function searchUsers(query) {
  const result = await db.query(
    `
    SELECT
      public_id,
      username,
      display_name,
      avatar_url,
      is_online
    FROM users
    WHERE
      username ILIKE $1
      OR display_name ILIKE $1
    LIMIT 20
    `,
    [`%${query}%`]
  );

  return result.rows;
}