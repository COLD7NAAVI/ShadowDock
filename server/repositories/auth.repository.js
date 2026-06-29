import db from "../config/db.js";

export async function findUserByEmail(
email
) {
const result = await db.query(
`       SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
[email]
);

return result.rows[0];
}

export async function findUserById(
id
) {
const result = await db.query(
`       SELECT
        id,
        public_id,
        username,
        email,
        password_hash,
        refresh_token,
        is_verified,
        is_online,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
[id]
);

return result.rows[0];
}

export async function findUserByPublicId(
publicId
) {
const result = await db.query(
`       SELECT
        public_id,
        username,
        email,
        is_verified,
        is_online,
        created_at
      FROM users
      WHERE public_id = $1
      LIMIT 1
    `,
[publicId]
);

return result.rows[0];
}

export async function createUser({
username,
email,
passwordHash,
}) {
const result = await db.query(
`       INSERT INTO users
      (
        username,
        email,
        password_hash
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING
        id,
        public_id,
        username,
        email,
        created_at
    `,
[
username,
email,
passwordHash,
]
);

return result.rows[0];
}

export async function saveRefreshToken(
userId,
refreshToken
) {
await db.query(
`       UPDATE users
      SET
        refresh_token = $1,
        updated_at = NOW()
      WHERE id = $2
    `,
[
refreshToken,
userId,
]
);
}

export async function getRefreshToken(
userId
) {
const result = await db.query(
`       SELECT refresh_token
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
[userId]
);

return result.rows[0]
?.refresh_token;
}

export async function removeRefreshToken(
userId
) {
await db.query(
`       UPDATE users
      SET
        refresh_token = NULL,
        updated_at = NOW()
      WHERE id = $1
    `,
[userId]
);
}
