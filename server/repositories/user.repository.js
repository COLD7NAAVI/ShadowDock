import db from "../config/db.js";

export async function findUserById(userId) {
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

export async function findUserByPublicId(publicId) {
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
/*
|--------------------------------------------------------------------------
| Mark User Online
|--------------------------------------------------------------------------
*/

export async function setUserOnline(
    userId
) {

    const result = await db.query(

        `
        UPDATE users
        SET

            is_online = TRUE,

            updated_at = NOW()

        WHERE id = $1

        RETURNING

            id,
            public_id,
            is_online,
            last_seen;
        `,

        [

            userId

        ]

    );

    return result.rows[0] ?? null;

}
/*
|--------------------------------------------------------------------------
| Mark User Offline
|--------------------------------------------------------------------------
*/

export async function setUserOffline(
    userId
) {

    const result = await db.query(

        `
        UPDATE users
        SET

            is_online = FALSE,

            last_seen = NOW(),

            updated_at = NOW()

        WHERE id = $1

        RETURNING

            id,
            public_id,
            is_online,
            last_seen;
        `,

        [

            userId

        ]

    );

    return result.rows[0] ?? null;

}