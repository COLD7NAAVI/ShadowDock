import db from "../config/db.js";

/*
|--------------------------------------------------------------------------
| Find User By ID
|--------------------------------------------------------------------------
*/

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

            avatar AS avatar_url,

            verified AS is_verified,

            (status = 'online') AS is_online,

            status,
            last_seen,
            created_at

        FROM users

        WHERE id = $1

        LIMIT 1
        `,

        [
            userId
        ]

    );

    return result.rows[0] ?? null;
}


/*
|--------------------------------------------------------------------------
| Find User By Public ID
|--------------------------------------------------------------------------
*/

export async function findUserByPublicId(publicId) {

    const result = await db.query(

        `
        SELECT

            id,
            public_id,
            username,
            display_name,
            bio,

            avatar AS avatar_url,

            verified AS is_verified,

            (status = 'online') AS is_online,

            status,
            last_seen,
            created_at

        FROM users

        WHERE public_id = $1

        LIMIT 1
        `,

        [
            publicId
        ]

    );

    return result.rows[0] ?? null;
}


/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/

export async function updateProfile(
    userId,
    data
) {

    const fields = [];

    const values = [];

    let index = 1;


    if (
        data.display_name !== undefined
    ) {

        fields.push(
            `display_name = $${index++}`
        );

        values.push(
            data.display_name
        );

    }


    if (
        data.bio !== undefined
    ) {

        fields.push(
            `bio = $${index++}`
        );

        values.push(
            data.bio
        );

    }


    if (
        data.avatar_url !== undefined
    ) {

        fields.push(
            `avatar = $${index++}`
        );

        values.push(
            data.avatar_url
        );

    }


    if (
        fields.length === 0
    ) {

        return await findUserById(
            userId
        );

    }


    fields.push(
        "updated_at = NOW()"
    );

    values.push(
        userId
    );


    const result = await db.query(

        `
        UPDATE users
        SET
            ${fields.join(", ")}
        WHERE id = $${index}
        RETURNING
            id,
            public_id,
            username,
            display_name,
            email,
            bio,
            avatar AS avatar_url,
            verified AS is_verified,
            (status = 'online') AS is_online,
            status,
            last_seen,
            created_at,
            updated_at
        `,

        values

    );


    return result.rows[0] ?? null;

}


/*
|--------------------------------------------------------------------------
| Search Users
|--------------------------------------------------------------------------
*/

export async function searchUsers(query) {

    const result = await db.query(

        `
        SELECT

            public_id,
            username,
            display_name,

            avatar AS avatar_url,

            (status = 'online') AS is_online

        FROM users

        WHERE

            username ILIKE $1

            OR display_name ILIKE $1

        LIMIT 20
        `,

        [
            `%${query}%`
        ]

    );

    return result.rows;
}


/*
|--------------------------------------------------------------------------
| Mark User Online
|--------------------------------------------------------------------------
*/

export async function setUserOnline(userId) {

    const result = await db.query(

        `
        UPDATE users

        SET

            status = 'online',

            updated_at = NOW()

        WHERE id = $1

        RETURNING

            id,
            public_id,
            status,

            (status = 'online') AS is_online,

            last_seen
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

export async function setUserOffline(userId) {

    const result = await db.query(

        `
        UPDATE users

        SET

            status = 'offline',

            last_seen = NOW(),

            updated_at = NOW()

        WHERE id = $1

        RETURNING

            id,
            public_id,
            status,

            (status = 'online') AS is_online,

            last_seen
        `,

        [
            userId
        ]

    );

    return result.rows[0] ?? null;
}