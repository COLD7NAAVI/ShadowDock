import { Router } from "express";

import healthRoutes from "./v1/health.routes.js";
import authRoutes from "./v1/auth.routes.js";
import userRoutes from "./v1/user.routes.js";
import friendRoutes from "./v1/friend.routes.js";
import chatRoutes from "./v1/chat.routes.js";
import messageRoutes from "./v1/message.routes.js";

import attachmentRoutes from "./v1/attachment.routes.js";
import reactionRoutes from "./v1/reaction.routes.js";
import notificationRoutes from "./v1/notification.routes.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
|
| Registration Order
|
| 1. Health
| 2. Authentication
| 3. Users
| 4. Friends
| 5. Chats
| 6. Messages
| 7. Attachments
| 8. Reactions
| 9. Notifications
|
| Future Modules
|
| • Calls
| • Voice
| • Video
| • Admin
| • Analytics
|
*/

router.use(
    "/health",
    healthRoutes
);

router.use(
    "/auth",
    authRoutes
);

router.use(
    "/users",
    userRoutes
);

router.use(
    "/friends",
    friendRoutes
);

router.use(
    "/chats",
    chatRoutes
);

router.use(
    "/messages",
    messageRoutes
);

router.use(
    "/attachments",
    attachmentRoutes
);

router.use(
    "/reactions",
    reactionRoutes
);

router.use(
    "/notifications",
    notificationRoutes
);

export default router;