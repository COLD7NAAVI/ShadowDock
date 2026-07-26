import { Router } from "express";

import auth
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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