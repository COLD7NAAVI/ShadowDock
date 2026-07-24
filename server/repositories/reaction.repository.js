import { query } from "../config/db.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Reaction Repository
|
| Responsibilities
|
| ✓ SQL Queries
| ✓ Reaction Persistence
| ✓ Retrieval
| ✓ Statistics
|
| Business logic belongs to the Service Layer.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Shared Column Definitions
|--------------------------------------------------------------------------
*/

const REACTION_COLUMNS = `
    r.id,
    r.public_id,

    r.message_id,
    r.user_id,

    r.user_public_id,

    r.reaction_type,
    r.reaction_value,

    r.emoji_unicode,
    r.emoji_shortcode,
    r.emoji_variant,
    r.emoji_pack,

    r.animated,
    r.premium,

    r.generator_type,
    r.generator_id,
    r.generator_name,

    r.display_order,
    r.highlighted,

    r.metadata,

    r.active,
    r.removed_at,
    r.removed_by,

    r.created_by,
    r.updated_by,

    r.created_at,
    r.updated_at
`;

const REACTION_WITH_MESSAGE_COLUMNS = `
    ${REACTION_COLUMNS},

    m.public_id AS message_public_id
`;

const REACTION_WITH_USER_COLUMNS = `
    ${REACTION_WITH_MESSAGE_COLUMNS},

    u.public_id AS user_public_lookup,
    u.username,
    u.display_name,
    u.avatar
`;

/*
|--------------------------------------------------------------------------
| Find Reaction By Internal ID
|--------------------------------------------------------------------------
*/

export async function findReactionById(
    reactionId
) {

    const result = await query(

        `
        SELECT

            ${REACTION_WITH_USER_COLUMNS}

        FROM reactions r

        INNER JOIN messages m

            ON m.id = r.message_id

        INNER JOIN users u

            ON u.id = r.user_id

        WHERE

            r.id = $1

        LIMIT 1;
        `,

        [

            reactionId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Find Reaction By Public ID
|--------------------------------------------------------------------------
*/

export async function findReactionByPublicId(
    publicId
) {

    const result = await query(

        `
        SELECT

            ${REACTION_WITH_USER_COLUMNS}

        FROM reactions r

        INNER JOIN messages m

            ON m.id = r.message_id

        INNER JOIN users u

            ON u.id = r.user_id

        WHERE

            r.public_id = $1

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
| Find Reactions By Public IDs
|--------------------------------------------------------------------------
|
| Bulk lookup.
|
| Future Uses
|
| • Bulk Delete
| • Export Chats
| • Analytics
| • Moderation
|
*/

export async function findReactionsByPublicIds(
    publicIds = []
) {

    if (

        !Array.isArray(publicIds)

        ||

        publicIds.length === 0

    ) {

        return [];

    }

    const result = await query(

        `
        SELECT

            ${REACTION_WITH_USER_COLUMNS}

        FROM reactions r

        INNER JOIN messages m

            ON m.id = r.message_id

        INNER JOIN users u

            ON u.id = r.user_id

        WHERE

            r.public_id = ANY($1)

        ORDER BY

            r.created_at ASC;
        `,

        [

            publicIds

        ]

    );

    return result.rows;

}
/*
|--------------------------------------------------------------------------
| Create Reaction
|--------------------------------------------------------------------------
|
| Creates a new reaction.
|
| Must execute inside an active transaction.
|
*/

export async function createReaction(

    client,

    {

        messageId,

        userId,

        userPublicId,

        reactionType = "emoji",

        reactionValue,

        emojiUnicode = null,

        emojiShortcode = null,

        emojiVariant = null,

        emojiPack = null,

        animated = false,

        premium = false,

        generatorType = "user",

        generatorId = null,

        generatorName = null,

        displayOrder = 0,

        highlighted = false,

        metadata = {},

        createdBy

    }

) {

    const result = await client.query(

        `
        INSERT INTO reactions (

            public_id,

            message_id,

            user_id,

            user_public_id,

            reaction_type,

            reaction_value,

            emoji_unicode,

            emoji_shortcode,

            emoji_variant,

            emoji_pack,

            animated,

            premium,

            generator_type,

            generator_id,

            generator_name,

            display_order,

            highlighted,

            metadata,

            created_by

        )

        VALUES (

            generate_public_id('react'),

            $1,

            $2,

            $3,

            $4,

            $5,

            $6,

            $7,

            $8,

            $9,

            $10,

            $11,

            $12,

            $13,

            $14,

            $15,

            $16,

            $17,

            $18

        )

        RETURNING *;
        `,

        [

            messageId,

            userId,

            userPublicId,

            reactionType,

            reactionValue,

            emojiUnicode,

            emojiShortcode,

            emojiVariant,

            emojiPack,

            animated,

            premium,

            generatorType,

            generatorId,

            generatorName,

            displayOrder,

            highlighted,

            metadata,

            createdBy

        ]

    );

    return result.rows[0];

}

/*
|--------------------------------------------------------------------------
| Update Reaction
|--------------------------------------------------------------------------
|
| Updates editable reaction metadata.
|
*/

export async function updateReaction(

    client,

    {

        reactionId,

        highlighted,

        displayOrder,

        metadata,

        updatedBy

    }

) {

    const result = await client.query(

        `
        UPDATE reactions

        SET

            highlighted = $1,

            display_order = $2,

            metadata = $3,

            updated_by = $4,

            updated_at = NOW()

        WHERE

            id = $5

        RETURNING *;
        `,

        [

            highlighted,

            displayOrder,

            metadata,

            updatedBy,

            reactionId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Deactivate Reaction
|--------------------------------------------------------------------------
|
| Soft remove.
|
*/

export async function deactivateReaction(

    client,

    {

        reactionId,

        removedBy

    }

) {

    const result = await client.query(

        `
        UPDATE reactions

        SET

            active = FALSE,

            removed_at = NOW(),

            removed_by = $1,

            updated_by = $1,

            updated_at = NOW()

        WHERE

            id = $2

        RETURNING *;
        `,

        [

            removedBy,

            reactionId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Reactivate Reaction
|--------------------------------------------------------------------------
*/

export async function reactivateReaction(

    client,

    {

        reactionId,

        updatedBy

    }

) {

    const result = await client.query(

        `
        UPDATE reactions

        SET

            active = TRUE,

            removed_at = NULL,

            removed_by = NULL,

            updated_by = $1,

            updated_at = NOW()

        WHERE

            id = $2

        RETURNING *;
        `,

        [

            updatedBy,

            reactionId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Permanently Delete Reaction
|--------------------------------------------------------------------------
|
| Used by cleanup jobs only.
|
*/

export async function deleteReaction(

    client,

    reactionId

) {

    await client.query(

        `
        DELETE FROM reactions

        WHERE

            id = $1;
        `,

        [

            reactionId

        ]

    );

}
/*
|--------------------------------------------------------------------------
| Get Message Reactions
|--------------------------------------------------------------------------
|
| Returns all active reactions for a message.
|
*/

export async function getMessageReactions(

    messageId

) {

    const result = await query(

        `
        SELECT

            ${REACTION_WITH_USER_COLUMNS}

        FROM reactions r

        INNER JOIN messages m

            ON m.id = r.message_id

        INNER JOIN users u

            ON u.id = r.user_id

        WHERE

            r.message_id = $1

        AND

            r.active = TRUE

        ORDER BY

            r.display_order ASC,

            r.created_at ASC;
        `,

        [

            messageId

        ]

    );

    return result.rows;

}

/*
|--------------------------------------------------------------------------
| Get User Reactions
|--------------------------------------------------------------------------
|
| Returns reactions created by a user.
|
*/

export async function getUserReactions(

    userId,

    limit = 100

) {

    const result = await query(

        `
        SELECT

            ${REACTION_WITH_USER_COLUMNS}

        FROM reactions r

        INNER JOIN messages m

            ON m.id = r.message_id

        INNER JOIN users u

            ON u.id = r.user_id

        WHERE

            r.user_id = $1

        AND

            r.active = TRUE

        ORDER BY

            r.created_at DESC

        LIMIT $2;
        `,

        [

            userId,

            limit

        ]

    );

    return result.rows;

}

/*
|--------------------------------------------------------------------------
| Find User Reaction
|--------------------------------------------------------------------------
|
| Used to determine whether a user has already reacted
| with a particular emoji/value.
|
*/

export async function findUserReaction(

    messageId,

    userId,

    reactionValue

) {

    const result = await query(

        `
        SELECT

            ${REACTION_COLUMNS}

        FROM reactions r

        WHERE

            r.message_id = $1

        AND

            r.user_id = $2

        AND

            r.reaction_value = $3

        LIMIT 1;
        `,

        [

            messageId,

            userId,

            reactionValue

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Count Reactions By Type
|--------------------------------------------------------------------------
|
| Example:
|
| emoji
| sticker
| badge
|
*/

export async function countReactionType(

    messageId,

    reactionType

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER AS total

        FROM reactions

        WHERE

            message_id = $1

        AND

            reaction_type = $2

        AND

            active = TRUE;
        `,

        [

            messageId,

            reactionType

        ]

    );

    return result.rows[0].total;

}

/*
|--------------------------------------------------------------------------
| Count Total Message Reactions
|--------------------------------------------------------------------------
*/

export async function countMessageReactions(

    messageId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER AS total

        FROM reactions

        WHERE

            message_id = $1

        AND

            active = TRUE;
        `,

        [

            messageId

        ]

    );

    return result.rows[0].total;

}

/*
|--------------------------------------------------------------------------
| Group Reactions By Emoji
|--------------------------------------------------------------------------
|
| Returns data ready for the frontend reaction bar.
|
| Example:
|
| 😀 12
| ❤️ 8
| 👍 5
|
*/

export async function groupReactionsByEmoji(

    messageId

) {

    const result = await query(

        `
        SELECT

            reaction_value,

            reaction_type,

            emoji_unicode,

            emoji_shortcode,

            COUNT(*)::INTEGER AS total

        FROM reactions

        WHERE

            message_id = $1

        AND

            active = TRUE

        GROUP BY

            reaction_value,

            reaction_type,

            emoji_unicode,

            emoji_shortcode

        ORDER BY

            total DESC,

            reaction_value ASC;
        `,

        [

            messageId

        ]

    );

    return result.rows;

}
/*
|--------------------------------------------------------------------------
| Update Reaction Metadata
|--------------------------------------------------------------------------
|
| Used for:
|
| • AI metadata
| • Bot metadata
| • Future analytics
|
*/

export async function updateReactionMetadata(

    client,

    {

        reactionId,

        metadata,

        updatedBy

    }

) {

    const result = await client.query(

        `
        UPDATE reactions

        SET

            metadata = $1,

            updated_by = $2,

            updated_at = NOW()

        WHERE

            id = $3

        RETURNING *;
        `,

        [

            metadata,

            updatedBy,

            reactionId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Reaction Exists
|--------------------------------------------------------------------------
*/

export async function reactionExists(

    messageId,

    userId,

    reactionValue

) {

    const result = await query(

        `
        SELECT EXISTS (

            SELECT 1

            FROM reactions

            WHERE

                message_id = $1

            AND

                user_id = $2

            AND

                reaction_value = $3

            AND

                active = TRUE

        ) AS exists;
        `,

        [

            messageId,

            userId,

            reactionValue

        ]

    );

    return result.rows[0].exists;

}

/*
|--------------------------------------------------------------------------
| Count User Reactions
|--------------------------------------------------------------------------
*/

export async function countUserReactions(

    userId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER AS total

        FROM reactions

        WHERE

            user_id = $1

        AND

            active = TRUE;
        `,

        [

            userId

        ]

    );

    return result.rows[0].total;

}

/*
|--------------------------------------------------------------------------
| Get Most Used Reactions
|--------------------------------------------------------------------------
|
| Analytics helper.
|
*/

export async function getMostUsedReactions(

    limit = 20

) {

    const result = await query(

        `
        SELECT

            reaction_value,

            reaction_type,

            emoji_unicode,

            emoji_shortcode,

            COUNT(*)::INTEGER AS total

        FROM reactions

        WHERE

            active = TRUE

        GROUP BY

            reaction_value,

            reaction_type,

            emoji_unicode,

            emoji_shortcode

        ORDER BY

            total DESC,

            reaction_value ASC

        LIMIT $1;
        `,

        [

            limit

        ]

    );

    return result.rows;

}

/*
|--------------------------------------------------------------------------
| Repository Summary
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ SQL Only
| ✓ CRUD Operations
| ✓ Active State Management
| ✓ Metadata Updates
| ✓ Message Queries
| ✓ User Queries
| ✓ Analytics
| ✓ Statistics
|
|--------------------------------------------------------------------------
|
| Repository Rules
|--------------------------------------------------------------------------
|
| Repository MUST:
|
| ✓ Execute SQL
| ✓ Return Data
|
| Repository MUST NEVER:
|
| ✗ Validate Requests
| ✗ Authorize Users
| ✗ Start Transactions
| ✗ Commit Transactions
| ✗ Rollback Transactions
| ✗ Emit Socket Events
| ✗ Apply Business Logic
|
|--------------------------------------------------------------------------
|
| Status
|--------------------------------------------------------------------------
|
| ✓ Production Ready
| ✓ PostgreSQL Optimized
| ✓ Repository Pattern
| ✓ Analytics Ready
| ✓ AI Ready
| ✓ Bot Ready
| ✓ Custom Emoji Ready
| ✓ Sticker Ready
| ✓ Premium Emoji Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/