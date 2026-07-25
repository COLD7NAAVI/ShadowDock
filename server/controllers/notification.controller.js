import asyncHandler from "../utils/asyncHandler.js";

import {

    createNotificationService,

    updateNotificationService,

    markNotificationSeenService,

    markNotificationReadService,

    dismissNotificationService,

    archiveNotificationService,

    deleteNotificationService,

    updateNotificationMetadataService,

    incrementNotificationOpenService,

    incrementNotificationClickService,

    getUserNotificationsService,

    getUnreadNotificationsService,

    getArchivedNotificationsService,

    searchNotificationsService,

    countUnreadNotificationsService,

    countUnseenNotificationsService,

    countUserNotificationsService,

    getNotificationStatisticsService

} from "../services/notification.service.js";

/*
|--------------------------------------------------------------------------
| Notification Controller
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Parse HTTP Requests
| ✓ Call Services
| ✓ Format Responses
| ✓ Delegate Business Logic
|
*/

/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
*/

export const createNotification = asyncHandler(

    async (

        req,

        res

    ) => {

        const notification = await createNotificationService(

            req.body

        );

        return res.status(201).json({

            success: true,

            message:

                "Notification created successfully.",

            data: notification

        });

    }

);

/*
|--------------------------------------------------------------------------
| Update Notification
|--------------------------------------------------------------------------
*/

export const updateNotification = asyncHandler(

    async (

        req,

        res

    ) => {

        const notification = await updateNotificationService(

            req.params.notificationPublicId,

            req.user.id,

            req.body

        );

        return res.status(200).json({

            success: true,

            message:

                "Notification updated successfully.",

            data: notification

        });

    }

);

/*
|--------------------------------------------------------------------------
| Mark Seen
|--------------------------------------------------------------------------
*/

export const markSeen = asyncHandler(

    async (

        req,

        res

    ) => {

        const notification = await markNotificationSeenService(

            req.params.notificationPublicId,

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message:

                "Notification marked as seen.",

            data: notification

        });

    }

);

/*
|--------------------------------------------------------------------------
| Mark Read
|--------------------------------------------------------------------------
*/

export const markRead = asyncHandler(

    async (

        req,

        res

    ) => {

        const notification = await markNotificationReadService(

            req.params.notificationPublicId,

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message:

                "Notification marked as read.",

            data: notification

        });

    }

);
/*
|--------------------------------------------------------------------------
| Dismiss Notification
|--------------------------------------------------------------------------
*/

export const dismissNotification = asyncHandler(

    async (

        req,

        res

    ) => {

        const notification = await dismissNotificationService(

            req.params.notificationPublicId,

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message:

                "Notification dismissed successfully.",

            data: notification

        });

    }

);

/*
|--------------------------------------------------------------------------
| Archive Notification
|--------------------------------------------------------------------------
*/

export const archiveNotification = asyncHandler(

    async (

        req,

        res

    ) => {

        const notification = await archiveNotificationService(

            req.params.notificationPublicId,

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message:

                "Notification archived successfully.",

            data: notification

        });

    }

);

/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
*/

export const deleteNotification = asyncHandler(

    async (

        req,

        res

    ) => {

        const notification = await deleteNotificationService(

            req.params.notificationPublicId,

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message:

                "Notification deleted successfully.",

            data: notification

        });

    }

);

/*
|--------------------------------------------------------------------------
| Update Notification Metadata
|--------------------------------------------------------------------------
*/

export const updateNotificationMetadata = asyncHandler(

    async (

        req,

        res

    ) => {

        const notification = await updateNotificationMetadataService(

            req.params.notificationPublicId,

            req.user.id,

            req.body.metadata ?? {}

        );

        return res.status(200).json({

            success: true,

            message:

                "Notification metadata updated.",

            data: notification

        });

    }

);

/*
|--------------------------------------------------------------------------
| Record Notification Open
|--------------------------------------------------------------------------
*/

export const recordNotificationOpen = asyncHandler(

    async (

        req,

        res

    ) => {

        const result = await incrementNotificationOpenService(

            req.params.notificationPublicId,

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message:

                "Notification open recorded.",

            data: result

        });

    }

);

/*
|--------------------------------------------------------------------------
| Record Notification Click
|--------------------------------------------------------------------------
*/

export const recordNotificationClick = asyncHandler(

    async (

        req,

        res

    ) => {

        const result = await incrementNotificationClickService(

            req.params.notificationPublicId,

            req.user.id

        );

        return res.status(200).json({

            success: true,

            message:

                "Notification click recorded.",

            data: result

        });

    }

);

/*
|--------------------------------------------------------------------------
| Get User Notifications
|--------------------------------------------------------------------------
*/

export const getUserNotifications = asyncHandler(

    async (

        req,

        res

    ) => {

        const {

            limit = 50,

            offset = 0

        } = req.query;

        const notifications = await getUserNotificationsService(

            req.user.id,

            Number(limit),

            Number(offset)

        );

        return res.status(200).json({

            success: true,

            data: notifications,

            pagination: {

                limit: Number(limit),

                offset: Number(offset)

            }

        });

    }

);

/*
|--------------------------------------------------------------------------
| Get Unread Notifications
|--------------------------------------------------------------------------
*/

export const getUnreadNotifications = asyncHandler(

    async (

        req,

        res

    ) => {

        const {

            limit = 50

        } = req.query;

        const notifications = await getUnreadNotificationsService(

            req.user.id,

            Number(limit)

        );

        return res.status(200).json({

            success: true,

            data: notifications

        });

    }

);

/*
|--------------------------------------------------------------------------
| Get Archived Notifications
|--------------------------------------------------------------------------
*/

export const getArchivedNotifications = asyncHandler(

    async (

        req,

        res

    ) => {

        const {

            limit = 50

        } = req.query;

        const notifications = await getArchivedNotificationsService(

            req.user.id,

            Number(limit)

        );

        return res.status(200).json({

            success: true,

            data: notifications

        });

    }

);

/*
|--------------------------------------------------------------------------
| Search Notifications
|--------------------------------------------------------------------------
*/

export const searchNotifications = asyncHandler(

    async (

        req,

        res

    ) => {

        const {

            q = "",

            limit = 50

        } = req.query;

        const notifications = await searchNotificationsService(

            req.user.id,

            q,

            Number(limit)

        );

        return res.status(200).json({

            success: true,

            data: notifications

        });

    }

);

/*
|--------------------------------------------------------------------------
| Count Unread Notifications
|--------------------------------------------------------------------------
*/

export const countUnreadNotifications = asyncHandler(

    async (

        req,

        res

    ) => {

        const count = await countUnreadNotificationsService(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            data: {

                unread: count

            }

        });

    }

);

/*
|--------------------------------------------------------------------------
| Count Unseen Notifications
|--------------------------------------------------------------------------
*/

export const countUnseenNotifications = asyncHandler(

    async (

        req,

        res

    ) => {

        const count = await countUnseenNotificationsService(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            data: {

                unseen: count

            }

        });

    }

);

/*
|--------------------------------------------------------------------------
| Count User Notifications
|--------------------------------------------------------------------------
*/

export const countUserNotifications = asyncHandler(

    async (

        req,

        res

    ) => {

        const count = await countUserNotificationsService(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            data: {

                total: count

            }

        });

    }

);

/*
|--------------------------------------------------------------------------
| Notification Statistics
|--------------------------------------------------------------------------
*/

export const getNotificationStatistics = asyncHandler(

    async (

        req,

        res

    ) => {

        const statistics = await getNotificationStatisticsService(

            req.user.id

        );

        return res.status(200).json({

            success: true,

            data: statistics

        });

    }

);

/*
|--------------------------------------------------------------------------
| Notification Controller
|--------------------------------------------------------------------------
|
| Controller MUST NEVER
|
| ✗ Execute SQL
| ✗ Access Database
| ✗ Apply Business Logic
| ✗ Modify Repository Data Directly
|
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ Thin Controller
| ✓ Service Driven
| ✓ Repository Pattern
| ✓ Transaction Ready
| ✓ Analytics Ready
| ✓ Socket.IO Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/