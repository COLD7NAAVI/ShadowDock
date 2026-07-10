import { Router } from "express";

import healthRoutes from "./v1/health.routes.js";
import authRoutes from "./v1/auth.routes.js";
import userRoutes from "./v1/user.routes.js";
import friendRoutes from "./v1/friend.routes.js";
import chatRoutes from "./v1/chat.routes.js";
import messageRoutes from "./v1/message.routes.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
|
| Route registration order:
|
| • Health
| • Authentication
| • Users
| • Friends
| • Chats
| • Messages
|
| Future modules:
|
| • Notifications
| • Attachments
| • Reactions
| • Calls
| • Admin
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

export default router;