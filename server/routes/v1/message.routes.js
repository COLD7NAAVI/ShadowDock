import { Router } from "express";

import auth from "../../middleware/auth.middleware.js";

import {
    getMessages,
    getChatMessages
} from "../../controllers/message.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Legacy Messages
|--------------------------------------------------------------------------
|
| GET /api/v1/messages/:chatId
|
| Uses the internal chat ID.
| Kept temporarily for backward compatibility.
|
*/

router.get(
    "/:chatId",
    auth,
    getMessages
);

/*
|--------------------------------------------------------------------------
| Chat Messages
|--------------------------------------------------------------------------
|
| GET /api/v1/messages/chat/:chatPublicId
|
| Query Parameters:
|
|   ?limit=50
|   ?before=2026-07-09T12:00:00Z
|
*/

router.get(
    "/chat/:chatPublicId",
    auth,
    getChatMessages
);

export default router;