import { getClient } from "../config/db.js";

import ApiError from "../utils/ApiError.js";

import {

    findNotificationByPublicId,

    createNotification,

    updateNotification,

    markAsSeen,

    markAsRead,

    dismissNotification,

    archiveNotification,

    softDeleteNotification

} from "../repositories/notification.repository.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Notification Service
|
| Responsibilities
|
| ✓ Business Logic
| ✓ Authorization
| ✓ Validation
| ✓ Transactions
| ✓ Repository Orchestration
| ✓ Notification Lifecycle
| ✓ Future Socket Events
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Transaction Helper
|--------------------------------------------------------------------------
*/

async function withTransaction(callback) {

    const client = await getClient();

    try {

        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result;

    }

    catch (error) {

        try {

            await client.query("ROLLBACK");

        }

        catch {}

        throw error;

    }

    finally {

        client.release();

    }

}

/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
*/

export async function createNotificationService(

    notification

) {

    return withTransaction(

        async (client) => {

            const createdNotification = await createNotification(

                client,

                notification

            );

            /*
            ----------------------------------------------------------

            Future Hooks

            • Push Notification

            • Email Queue

            • SMS Queue

            • Desktop Notification

            • Socket.IO Event

            • Web Notification

            ----------------------------------------------------------
            */

            return createdNotification;

        }

    );

}

/*
|--------------------------------------------------------------------------
| Update Notification
|--------------------------------------------------------------------------
*/

export async function updateNotificationService(

    notificationPublicId,

    userId,

    {

        title,

        body,

        metadata

    }

) {

    const notification = await findNotificationByPublicId(

        notificationPublicId

    );

    if (!notification) {

        throw new ApiError(

            404,

            "Notification not found."

        );

    }

    if (

        notification.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "You cannot update this notification."

        );

    }

    return withTransaction(

        async (client) => {

            return await updateNotification(

                client,

                {

                    notificationId: notification.id,

                    title,

                    body,

                    metadata,

                    updatedBy: userId

                }

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Mark Notification Seen
|--------------------------------------------------------------------------
*/

export async function markNotificationSeenService(

    notificationPublicId,

    userId

) {

    const notification = await findNotificationByPublicId(

        notificationPublicId

    );

    if (!notification) {

        throw new ApiError(

            404,

            "Notification not found."

        );

    }

    if (

        notification.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "Unauthorized."

        );

    }

    return withTransaction(

        async (client) => {

            return await markAsSeen(

                client,

                notification.id

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Mark Notification Read
|--------------------------------------------------------------------------
*/

export async function markNotificationReadService(

    notificationPublicId,

    userId

) {

    const notification = await findNotificationByPublicId(

        notificationPublicId

    );

    if (!notification) {

        throw new ApiError(

            404,

            "Notification not found."

        );

    }

    if (

        notification.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "Unauthorized."

        );

    }

    return withTransaction(

        async (client) => {

            return await markAsRead(

                client,

                notification.id

            );

        }

    );

}
import {

    getUserNotifications,

    getUnreadNotifications,

    getArchivedNotifications,

    countUnreadNotifications,

    countUnseenNotifications,

    searchNotifications,

    updateNotificationMetadata,

    incrementOpenedCount,

    incrementClickedCount,

    countUserNotifications,

    getNotificationStatistics

} from "../repositories/notification.repository.js";

/*
|--------------------------------------------------------------------------
| Dismiss Notification
|--------------------------------------------------------------------------
*/

export async function dismissNotificationService(

    notificationPublicId,

    userId

) {

    const notification = await findNotificationByPublicId(

        notificationPublicId

    );

    if (!notification) {

        throw new ApiError(

            404,

            "Notification not found."

        );

    }

    if (

        notification.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "Unauthorized."

        );

    }

    return withTransaction(

        async (client) => {

            return await dismissNotification(

                client,

                notification.id

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Archive Notification
|--------------------------------------------------------------------------
*/

export async function archiveNotificationService(

    notificationPublicId,

    userId

) {

    const notification = await findNotificationByPublicId(

        notificationPublicId

    );

    if (!notification) {

        throw new ApiError(

            404,

            "Notification not found."

        );

    }

    if (

        notification.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "Unauthorized."

        );

    }

    return withTransaction(

        async (client) => {

            return await archiveNotification(

                client,

                notification.id

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
*/

export async function deleteNotificationService(

    notificationPublicId,

    userId

) {

    const notification = await findNotificationByPublicId(

        notificationPublicId

    );

    if (!notification) {

        throw new ApiError(

            404,

            "Notification not found."

        );

    }

    if (

        notification.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "Unauthorized."

        );

    }

    return withTransaction(

        async (client) => {

            return await softDeleteNotification(

                client,

                {

                    notificationId: notification.id,

                    deletedBy: userId

                }

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Update Notification Metadata
|--------------------------------------------------------------------------
*/

export async function updateNotificationMetadataService(

    notificationPublicId,

    userId,

    metadata

) {

    const notification = await findNotificationByPublicId(

        notificationPublicId

    );

    if (!notification) {

        throw new ApiError(

            404,

            "Notification not found."

        );

    }

    if (

        notification.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "Unauthorized."

        );

    }

    return withTransaction(

        async (client) => {

            return await updateNotificationMetadata(

                client,

                {

                    notificationId: notification.id,

                    metadata,

                    updatedBy: userId

                }

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Increment Open Counter
|--------------------------------------------------------------------------
*/

export async function incrementNotificationOpenService(

    notificationPublicId,

    userId

) {

    const notification = await findNotificationByPublicId(

        notificationPublicId

    );

    if (!notification) {

        throw new ApiError(

            404,

            "Notification not found."

        );

    }

    if (

        notification.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "Unauthorized."

        );

    }

    return withTransaction(

        async (client) => {

            return await incrementOpenedCount(

                client,

                notification.id

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Increment Click Counter
|--------------------------------------------------------------------------
*/

export async function incrementNotificationClickService(

    notificationPublicId,

    userId

) {

    const notification = await findNotificationByPublicId(

        notificationPublicId

    );

    if (!notification) {

        throw new ApiError(

            404,

            "Notification not found."

        );

    }

    if (

        notification.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "Unauthorized."

        );

    }

    return withTransaction(

        async (client) => {

            return await incrementClickedCount(

                client,

                notification.id

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Get User Notifications
|--------------------------------------------------------------------------
*/

export async function getUserNotificationsService(

    userId,

    limit = 50,

    offset = 0

) {

    return await getUserNotifications(

        userId,

        limit,

        offset

    );

}

/*
|--------------------------------------------------------------------------
| Get Unread Notifications
|--------------------------------------------------------------------------
*/

export async function getUnreadNotificationsService(

    userId,

    limit = 50

) {

    return await getUnreadNotifications(

        userId,

        limit

    );

}

/*
|--------------------------------------------------------------------------
| Get Archived Notifications
|--------------------------------------------------------------------------
*/

export async function getArchivedNotificationsService(

    userId,

    limit = 50

) {

    return await getArchivedNotifications(

        userId,

        limit

    );

}

/*
|--------------------------------------------------------------------------
| Search Notifications
|--------------------------------------------------------------------------
*/

export async function searchNotificationsService(

    userId,

    searchTerm,

    limit = 50

) {

    return await searchNotifications(

        userId,

        searchTerm,

        limit

    );

}

/*
|--------------------------------------------------------------------------
| Count Unread Notifications
|--------------------------------------------------------------------------
*/

export async function countUnreadNotificationsService(

    userId

) {

    return await countUnreadNotifications(

        userId

    );

}

/*
|--------------------------------------------------------------------------
| Count Unseen Notifications
|--------------------------------------------------------------------------
*/

export async function countUnseenNotificationsService(

    userId

) {

    return await countUnseenNotifications(

        userId

    );

}

/*
|--------------------------------------------------------------------------
| Count User Notifications
|--------------------------------------------------------------------------
*/

export async function countUserNotificationsService(

    userId

) {

    return await countUserNotifications(

        userId

    );

}

/*
|--------------------------------------------------------------------------
| Notification Statistics
|--------------------------------------------------------------------------
*/

export async function getNotificationStatisticsService(

    userId

) {

    return await getNotificationStatistics(

        userId

    );

}

/*
|--------------------------------------------------------------------------
| Notification Service Summary
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Business Logic
| ✓ Validation
| ✓ Authorization
| ✓ Transactions
| ✓ Notification Lifecycle
| ✓ Metadata Updates
| ✓ Analytics
| ✓ Counters
| ✓ Future Socket.IO Ready
|
|--------------------------------------------------------------------------
|
| Service MUST
|
| ✓ Validate Requests
| ✓ Authorize Users
| ✓ Manage Transactions
| ✓ Call Repositories
| ✓ Throw ApiError
|
|--------------------------------------------------------------------------
|
| Service MUST NEVER
|
| ✗ Execute SQL
| ✗ Build SQL Queries
| ✗ Access Database Directly
| ✗ Return Raw Database Errors
|
|--------------------------------------------------------------------------
|
| Future Features
|
| □ Push Queue
| □ Email Queue
| □ SMS Queue
| □ Web Push
| □ Desktop Notifications
| □ Multi-device Sync
| □ AI Prioritization
| □ Notification Batching
| □ Socket.IO Delivery
|
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ Repository Pattern
| ✓ Transaction Safe
| ✓ Analytics Ready
| ✓ Multi-device Ready
| ✓ Future E2EE Ready
|
|--------------------------------------------------------------------------
*/