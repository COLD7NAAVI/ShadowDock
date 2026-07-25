import { Router } from "express";

import { authenticate }
    from "../../middleware/auth.middleware.js";

import {

    createNotification,

    updateNotification,

    markNotificationSeen,

    markNotificationRead,

    dismissNotification,

    archiveNotification,

    deleteNotification,

    updateNotificationMetadata,

    incrementNotificationOpen,

    incrementNotificationClick,

    getUserNotifications,

    getUnreadNotifications,

    getArchivedNotifications,

    searchNotifications,

    countUnreadNotifications,

    countUnseenNotifications,

    countUserNotifications,

    getNotificationStatistics

} from "../../controllers/notification.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Notification Routes
|--------------------------------------------------------------------------
|
| Base URL
|
| /api/v1/notifications
|
*/

/*
|--------------------------------------------------------------------------
| Create Notification
|--------------------------------------------------------------------------
|
| POST /notifications
|
*/

router.post(
    "/",
    authenticate,
    createNotification
);

/*
|--------------------------------------------------------------------------
| Update Notification
|--------------------------------------------------------------------------
|
| PATCH /notifications/:notificationPublicId
|
*/

router.patch(
    "/:notificationPublicId",
    authenticate,
    updateNotification
);

/*
|--------------------------------------------------------------------------
| Mark Seen
|--------------------------------------------------------------------------
|
| PATCH /notifications/:notificationPublicId/seen
|
*/

router.patch(
    "/:notificationPublicId/seen",
    authenticate,
    markNotificationSeen
);

/*
|--------------------------------------------------------------------------
| Mark Read
|--------------------------------------------------------------------------
|
| PATCH /notifications/:notificationPublicId/read
|
*/

router.patch(
    "/:notificationPublicId/read",
    authenticate,
    markNotificationRead
);

/*
|--------------------------------------------------------------------------
| Dismiss Notification
|--------------------------------------------------------------------------
|
| PATCH /notifications/:notificationPublicId/dismiss
|
*/

router.patch(
    "/:notificationPublicId/dismiss",
    authenticate,
    dismissNotification
);

/*
|--------------------------------------------------------------------------
| Archive Notification
|--------------------------------------------------------------------------
|
| PATCH /notifications/:notificationPublicId/archive
|
*/

router.patch(
    "/:notificationPublicId/archive",
    authenticate,
    archiveNotification
);

/*
|--------------------------------------------------------------------------
| Delete Notification
|--------------------------------------------------------------------------
|
| DELETE /notifications/:notificationPublicId
|
*/

router.delete(
    "/:notificationPublicId",
    authenticate,
    deleteNotification
);

/*
|--------------------------------------------------------------------------
| Update Metadata
|--------------------------------------------------------------------------
|
| PATCH /notifications/:notificationPublicId/metadata
|
*/

router.patch(
    "/:notificationPublicId/metadata",
    authenticate,
    updateNotificationMetadata
);

/*
|--------------------------------------------------------------------------
| Increment Open Counter
|--------------------------------------------------------------------------
|
| POST /notifications/:notificationPublicId/open
|
*/

router.post(
    "/:notificationPublicId/open",
    authenticate,
    incrementNotificationOpen
);

/*
|--------------------------------------------------------------------------
| Increment Click Counter
|--------------------------------------------------------------------------
|
| POST /notifications/:notificationPublicId/click
|
*/

router.post(
    "/:notificationPublicId/click",
    authenticate,
    incrementNotificationClick
);

/*
|--------------------------------------------------------------------------
| User Notifications
|--------------------------------------------------------------------------
|
| GET /notifications
|
*/

router.get(
    "/",
    authenticate,
    getUserNotifications
);

/*
|--------------------------------------------------------------------------
| Unread Notifications
|--------------------------------------------------------------------------
|
| GET /notifications/unread
|
*/

router.get(
    "/unread",
    authenticate,
    getUnreadNotifications
);

/*
|--------------------------------------------------------------------------
| Archived Notifications
|--------------------------------------------------------------------------
|
| GET /notifications/archived
|
*/

router.get(
    "/archived",
    authenticate,
    getArchivedNotifications
);

/*
|--------------------------------------------------------------------------
| Search Notifications
|--------------------------------------------------------------------------
|
| GET /notifications/search
|
*/

router.get(
    "/search",
    authenticate,
    searchNotifications
);

/*
|--------------------------------------------------------------------------
| Count Unread
|--------------------------------------------------------------------------
|
| GET /notifications/count/unread
|
*/

router.get(
    "/count/unread",
    authenticate,
    countUnreadNotifications
);

/*
|--------------------------------------------------------------------------
| Count Unseen
|--------------------------------------------------------------------------
|
| GET /notifications/count/unseen
|
*/

router.get(
    "/count/unseen",
    authenticate,
    countUnseenNotifications
);

/*
|--------------------------------------------------------------------------
| Count User Notifications
|--------------------------------------------------------------------------
|
| GET /notifications/count
|
*/

router.get(
    "/count",
    authenticate,
    countUserNotifications
);

/*
|--------------------------------------------------------------------------
| Notification Statistics
|--------------------------------------------------------------------------
|
| GET /notifications/statistics
|
*/

router.get(
    "/statistics",
    authenticate,
    getNotificationStatistics
);

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
|
| ✓ Production Ready
| ✓ RESTful Routes
| ✓ Thin Router
| ✓ Authentication Protected
| ✓ Controller Driven
| ✓ Service Driven
| ✓ Repository Pattern
| ✓ Analytics Ready
| ✓ Socket.IO Ready
| ✓ Multi-device Ready
| ✓ Future E2EE Compatible
|
*/

export default router;