import { query } from "../config/db.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Notification Repository
|
| Responsibilities
|
| ✓ SQL Queries
| ✓ Notification Persistence
| ✓ Retrieval
| ✓ Analytics
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

const NOTIFICATION_COLUMNS = `
    n.id,
    n.public_id,

    n.user_id,
    n.actor_user_id,

    n.chat_id,
    n.message_id,
    n.attachment_id,
    n.reaction_id,

    n.notification_type,
    n.category,
    n.priority,

    n.title,
    n.body,

    n.image_url,
    n.icon,
    n.accent_color,

    n.action_url,
    n.action_label,

    n.metadata,

    n.source_type,
    n.generator_type,

    n.deliver_in_app,
    n.deliver_push,
    n.deliver_email,
    n.deliver_sms,
    n.deliver_desktop,
    n.deliver_web,

    n.silent,
    n.vibration,
    n.play_sound,
    n.badge_increment,

    n.collapse_key,
    n.notification_group,

    n.delivery_status,
    n.delivery_attempts,
    n.max_delivery_attempts,
    n.last_delivery_attempt,
    n.delivered_at,
    n.failed_at,
    n.failure_reason,

    n.seen,
    n.seen_at,

    n.read,
    n.read_at,

    n.dismissed,
    n.dismissed_at,

    n.archived,
    n.archived_at,

    n.scheduled_for,
    n.expires_at,
    n.auto_delete_at,

    n.sync_required,
    n.sync_completed,
    n.sync_completed_at,
    n.device_scope,

    n.primary_action,
    n.secondary_action,
    n.action_payload,

    n.opened_count,
    n.clicked_count,
    n.last_opened_at,

    n.created_by,
    n.updated_by,
    n.deleted_by,
    n.deleted_at,

    n.created_at,
    n.updated_at
`;

const NOTIFICATION_WITH_USER_COLUMNS = `
    ${NOTIFICATION_COLUMNS},

    u.public_id AS user_public_id,
    u.username,
    u.display_name,
    u.avatar
`;

const NOTIFICATION_WITH_ACTOR_COLUMNS = `
    ${NOTIFICATION_WITH_USER_COLUMNS},

    actor.public_id AS actor_public_id,
    actor.username AS actor_username,
    actor.display_name AS actor_display_name,
    actor.avatar AS actor_avatar
`;

/*
|--------------------------------------------------------------------------
| Find Notification By Internal ID
|--------------------------------------------------------------------------
*/

export async function findNotificationById(
    notificationId
) {

    const result = await query(

        `
        SELECT

            ${NOTIFICATION_WITH_ACTOR_COLUMNS}

        FROM notifications n

        INNER JOIN users u

            ON u.id = n.user_id

        LEFT JOIN users actor

            ON actor.id = n.actor_user_id

        WHERE

            n.id = $1

        LIMIT 1;
        `,

        [

            notificationId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Find Notification By Public ID
|--------------------------------------------------------------------------
*/

export async function findNotificationByPublicId(
    publicId
) {

    const result = await query(

        `
        SELECT

            ${NOTIFICATION_WITH_ACTOR_COLUMNS}

        FROM notifications n

        INNER JOIN users u

            ON u.id = n.user_id

        LEFT JOIN users actor

            ON actor.id = n.actor_user_id

        WHERE

            n.public_id = $1

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
| Find Notifications By Public IDs
|--------------------------------------------------------------------------
|
| Bulk lookup.
|
| Future Uses
|
| • Bulk Archive
| • Bulk Delete
| • Sync
| • Analytics
|
*/

export async function findNotificationsByPublicIds(
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

            ${NOTIFICATION_WITH_ACTOR_COLUMNS}

        FROM notifications n

        INNER JOIN users u

            ON u.id = n.user_id

        LEFT JOIN users actor

            ON actor.id = n.actor_user_id

        WHERE

            n.public_id = ANY($1)

        ORDER BY

            n.created_at DESC;
        `,

        [

            publicIds

        ]

    );

    return result.rows;

}
/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
|
| Creates a notification.
|
| Must execute inside an active transaction.
|
*/

export async function createNotification(

    client,

    notification

) {

    const result = await client.query(

        `
        INSERT INTO notifications (

            public_id,

            user_id,
            actor_user_id,

            chat_id,
            message_id,
            attachment_id,
            reaction_id,

            notification_type,
            category,
            priority,

            title,
            body,

            image_url,
            icon,
            accent_color,

            action_url,
            action_label,

            metadata,

            source_type,
            generator_type,

            deliver_in_app,
            deliver_push,
            deliver_email,
            deliver_sms,
            deliver_desktop,
            deliver_web,

            silent,
            vibration,
            play_sound,
            badge_increment,

            collapse_key,
            notification_group,

            scheduled_for,
            expires_at,
            auto_delete_at,

            device_scope,

            primary_action,
            secondary_action,

            action_payload,

            created_by

        )

        VALUES (

            generate_public_id('ntf'),

            $1,$2,

            $3,$4,$5,$6,

            $7,$8,$9,

            $10,$11,

            $12,$13,$14,

            $15,$16,

            $17,

            $18,$19,

            $20,$21,$22,$23,$24,$25,

            $26,$27,$28,$29,

            $30,$31,

            $32,$33,$34,

            $35,

            $36,$37,

            $38,

            $39

        )

        RETURNING *;
        `,

        [

            notification.userId,
            notification.actorUserId,

            notification.chatId,
            notification.messageId,
            notification.attachmentId,
            notification.reactionId,

            notification.notificationType,
            notification.category,
            notification.priority,

            notification.title,
            notification.body,

            notification.imageUrl,
            notification.icon,
            notification.accentColor,

            notification.actionUrl,
            notification.actionLabel,

            notification.metadata,

            notification.sourceType,
            notification.generatorType,

            notification.deliverInApp,
            notification.deliverPush,
            notification.deliverEmail,
            notification.deliverSms,
            notification.deliverDesktop,
            notification.deliverWeb,

            notification.silent,
            notification.vibration,
            notification.playSound,
            notification.badgeIncrement,

            notification.collapseKey,
            notification.notificationGroup,

            notification.scheduledFor,
            notification.expiresAt,
            notification.autoDeleteAt,

            notification.deviceScope,

            notification.primaryAction,
            notification.secondaryAction,

            notification.actionPayload,

            notification.createdBy

        ]

    );

    return result.rows[0];

}

/*
|--------------------------------------------------------------------------
| Update Notification
|--------------------------------------------------------------------------
*/

export async function updateNotification(

    client,

    {

        notificationId,

        title,

        body,

        metadata,

        updatedBy

    }

) {

    const result = await client.query(

        `
        UPDATE notifications

        SET

            title = $1,

            body = $2,

            metadata = $3,

            updated_by = $4,

            updated_at = NOW()

        WHERE

            id = $5

        RETURNING *;
        `,

        [

            title,

            body,

            metadata,

            updatedBy,

            notificationId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Mark Notification As Seen
|--------------------------------------------------------------------------
*/

export async function markAsSeen(

    client,

    notificationId

) {

    const result = await client.query(

        `
        UPDATE notifications

        SET

            seen = TRUE,

            seen_at = NOW(),

            updated_at = NOW()

        WHERE

            id = $1

        AND

            seen = FALSE

        RETURNING *;
        `,

        [

            notificationId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Mark Notification As Read
|--------------------------------------------------------------------------
*/

export async function markAsRead(

    client,

    notificationId

) {

    const result = await client.query(

        `
        UPDATE notifications

        SET

            read = TRUE,

            read_at = NOW(),

            updated_at = NOW()

        WHERE

            id = $1

        AND

            read = FALSE

        RETURNING *;
        `,

        [

            notificationId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Dismiss Notification
|--------------------------------------------------------------------------
*/

export async function dismissNotification(

    client,

    notificationId

) {

    const result = await client.query(

        `
        UPDATE notifications

        SET

            dismissed = TRUE,

            dismissed_at = NOW(),

            updated_at = NOW()

        WHERE

            id = $1

        RETURNING *;
        `,

        [

            notificationId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Archive Notification
|--------------------------------------------------------------------------
*/

export async function archiveNotification(

    client,

    notificationId

) {

    const result = await client.query(

        `
        UPDATE notifications

        SET

            archived = TRUE,

            archived_at = NOW(),

            updated_at = NOW()

        WHERE

            id = $1

        RETURNING *;
        `,

        [

            notificationId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Soft Delete Notification
|--------------------------------------------------------------------------
*/

export async function softDeleteNotification(

    client,

    {

        notificationId,

        deletedBy

    }

) {

    const result = await client.query(

        `
        UPDATE notifications

        SET

            deleted_at = NOW(),

            deleted_by = $1,

            updated_by = $1,

            updated_at = NOW()

        WHERE

            id = $2

        RETURNING *;
        `,

        [

            deletedBy,

            notificationId

        ]

    );

    return result.rows[0] ?? null;

}
/*
|--------------------------------------------------------------------------
| Get User Notifications
|--------------------------------------------------------------------------
|
| Returns notifications for a user.
|
*/

export async function getUserNotifications(

    userId,

    limit = 50,

    offset = 0

) {

    const result = await query(

        `
        SELECT

            ${NOTIFICATION_WITH_ACTOR_COLUMNS}

        FROM notifications n

        INNER JOIN users u

            ON u.id = n.user_id

        LEFT JOIN users actor

            ON actor.id = n.actor_user_id

        WHERE

            n.user_id = $1

        AND

            n.deleted_at IS NULL

        ORDER BY

            n.created_at DESC

        LIMIT $2

        OFFSET $3;
        `,

        [

            userId,

            limit,

            offset

        ]

    );

    return result.rows;

}

/*
|--------------------------------------------------------------------------
| Get Unread Notifications
|--------------------------------------------------------------------------
*/

export async function getUnreadNotifications(

    userId,

    limit = 50

) {

    const result = await query(

        `
        SELECT

            ${NOTIFICATION_WITH_ACTOR_COLUMNS}

        FROM notifications n

        INNER JOIN users u

            ON u.id = n.user_id

        LEFT JOIN users actor

            ON actor.id = n.actor_user_id

        WHERE

            n.user_id = $1

        AND

            n.read = FALSE

        AND

            n.deleted_at IS NULL

        ORDER BY

            n.created_at DESC

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
| Get Archived Notifications
|--------------------------------------------------------------------------
*/

export async function getArchivedNotifications(

    userId,

    limit = 50

) {

    const result = await query(

        `
        SELECT

            ${NOTIFICATION_WITH_ACTOR_COLUMNS}

        FROM notifications n

        INNER JOIN users u

            ON u.id = n.user_id

        LEFT JOIN users actor

            ON actor.id = n.actor_user_id

        WHERE

            n.user_id = $1

        AND

            n.archived = TRUE

        AND

            n.deleted_at IS NULL

        ORDER BY

            n.created_at DESC

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
| Count Unread Notifications
|--------------------------------------------------------------------------
*/

export async function countUnreadNotifications(

    userId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER AS total

        FROM notifications

        WHERE

            user_id = $1

        AND

            read = FALSE

        AND

            deleted_at IS NULL;
        `,

        [

            userId

        ]

    );

    return result.rows[0].total;

}

/*
|--------------------------------------------------------------------------
| Count Unseen Notifications
|--------------------------------------------------------------------------
*/

export async function countUnseenNotifications(

    userId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER AS total

        FROM notifications

        WHERE

            user_id = $1

        AND

            seen = FALSE

        AND

            deleted_at IS NULL;
        `,

        [

            userId

        ]

    );

    return result.rows[0].total;

}

/*
|--------------------------------------------------------------------------
| Search Notifications
|--------------------------------------------------------------------------
|
| Searches title and body.
|
*/

export async function searchNotifications(

    userId,

    searchTerm,

    limit = 50

) {

    const result = await query(

        `
        SELECT

            ${NOTIFICATION_WITH_ACTOR_COLUMNS}

        FROM notifications n

        INNER JOIN users u

            ON u.id = n.user_id

        LEFT JOIN users actor

            ON actor.id = n.actor_user_id

        WHERE

            n.user_id = $1

        AND

            n.deleted_at IS NULL

        AND

        (

            n.title ILIKE '%' || $2 || '%'

            OR

            n.body ILIKE '%' || $2 || '%'

        )

        ORDER BY

            n.created_at DESC

        LIMIT $3;
        `,

        [

            userId,

            searchTerm,

            limit

        ]

    );

    return result.rows;

}

/*
|--------------------------------------------------------------------------
| Delete Expired Notifications
|--------------------------------------------------------------------------
|
| Used by scheduled cleanup jobs.
|
*/

export async function deleteExpiredNotifications(

    client

) {

    const result = await client.query(

        `
        DELETE FROM notifications

        WHERE

            auto_delete_at IS NOT NULL

        AND

            auto_delete_at <= NOW()

        RETURNING id;
        `

    );

    return result.rows;

}
/*
|--------------------------------------------------------------------------
| Update Notification Metadata
|--------------------------------------------------------------------------
|
| Used for:
|
| • AI metadata
| • Delivery metadata
| • Future analytics
|
*/

export async function updateNotificationMetadata(

    client,

    {

        notificationId,

        metadata,

        updatedBy

    }

) {

    const result = await client.query(

        `
        UPDATE notifications

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

            notificationId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Increment Open Counter
|--------------------------------------------------------------------------
*/

export async function incrementOpenedCount(

    client,

    notificationId

) {

    const result = await client.query(

        `
        UPDATE notifications

        SET

            opened_count = opened_count + 1,

            last_opened_at = NOW(),

            updated_at = NOW()

        WHERE

            id = $1

        RETURNING *;
        `,

        [

            notificationId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Increment Click Counter
|--------------------------------------------------------------------------
*/

export async function incrementClickedCount(

    client,

    notificationId

) {

    const result = await client.query(

        `
        UPDATE notifications

        SET

            clicked_count = clicked_count + 1,

            updated_at = NOW()

        WHERE

            id = $1

        RETURNING *;
        `,

        [

            notificationId

        ]

    );

    return result.rows[0] ?? null;

}

/*
|--------------------------------------------------------------------------
| Notification Exists
|--------------------------------------------------------------------------
*/

export async function notificationExists(

    notificationId

) {

    const result = await query(

        `
        SELECT EXISTS(

            SELECT 1

            FROM notifications

            WHERE

                id = $1

            AND

                deleted_at IS NULL

        ) AS exists;
        `,

        [

            notificationId

        ]

    );

    return result.rows[0].exists;

}

/*
|--------------------------------------------------------------------------
| Count User Notifications
|--------------------------------------------------------------------------
*/

export async function countUserNotifications(

    userId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER AS total

        FROM notifications

        WHERE

            user_id = $1

        AND

            deleted_at IS NULL;
        `,

        [

            userId

        ]

    );

    return result.rows[0].total;

}

/*
|--------------------------------------------------------------------------
| Get Notification Statistics
|--------------------------------------------------------------------------
|
| Dashboard helper.
|
*/

export async function getNotificationStatistics(

    userId

) {

    const result = await query(

        `
        SELECT

            COUNT(*)::INTEGER                                          AS total,

            COUNT(*) FILTER (WHERE read = FALSE)::INTEGER              AS unread,

            COUNT(*) FILTER (WHERE seen = FALSE)::INTEGER              AS unseen,

            COUNT(*) FILTER (WHERE archived = TRUE)::INTEGER           AS archived,

            COUNT(*) FILTER (WHERE delivery_status = 'failed')::INTEGER AS failed,

            COUNT(*) FILTER (WHERE delivery_status = 'queued')::INTEGER AS queued

        FROM notifications

        WHERE

            user_id = $1

        AND

            deleted_at IS NULL;
        `,

        [

            userId

        ]

    );

    return result.rows[0];

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
| ✓ Read / Seen Lifecycle
| ✓ Archive
| ✓ Soft Delete
| ✓ Analytics
| ✓ Notification Statistics
| ✓ Metadata Updates
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
| ✗ Apply Business Logic
| ✗ Authorize Users
| ✗ Emit Socket Events
| ✗ Commit Transactions
| ✗ Rollback Transactions
|
|--------------------------------------------------------------------------
|
| Status
|--------------------------------------------------------------------------
|
| ✓ Production Ready
| ✓ PostgreSQL Optimized
| ✓ Repository Pattern
| ✓ Push Notification Ready
| ✓ Email Ready
| ✓ SMS Ready
| ✓ Desktop Ready
| ✓ Web Ready
| ✓ Multi-device Ready
| ✓ Analytics Ready
| ✓ AI Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/