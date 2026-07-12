import { Router } from "express";

import auth from "../../middleware/auth.middleware.js";

import {

    sendMessage,

    getChatMessages,

    editMessage,

    deleteMessage

} from "../../controllers/message.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Message Routes
|
| Public IDs (UUIDs) only.
|
| Authentication required for every endpoint.
|
*/

/*
|--------------------------------------------------------------------------
| Send Message
|--------------------------------------------------------------------------
|
| POST /api/v1/messages
|
| Body
|
| {
|     chatPublicId,
|     text,
|     messageType,
|     metadata
| }
|
*/

router.post(

    "/",

    auth,

    sendMessage

);

/*
|--------------------------------------------------------------------------
| Get Chat Messages
|--------------------------------------------------------------------------
|
| GET /api/v1/messages/chat/:chatPublicId
|
| Query Parameters
|
| ?limit=50
| ?before=2026-07-09T12:00:00Z
|
| Supports:
|
| ✓ Infinite scrolling
| ✓ Pagination
| ✓ Read receipts
| ✓ Attachments
| ✓ Reactions
|
*/

router.get(

    "/chat/:chatPublicId",

    auth,

    getChatMessages

);

/*
|--------------------------------------------------------------------------
| Edit Message
|--------------------------------------------------------------------------
|
|
| PATCH /api/v1/messages/:messagePublicId
|
*/

router.patch(

    "/:messagePublicId",

    auth,

    editMessage

);

/*
|--------------------------------------------------------------------------
| Delete Message
|--------------------------------------------------------------------------
|
| DELETE /api/v1/messages/:messagePublicId
|
*/

router.delete(

    "/:messagePublicId",

    auth,

    deleteMessage

);

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
|
| ✓ Production Ready
| ✓ UUID Based
| ✓ Infinite Scroll Ready
| ✓ Socket.IO Ready
| ✓ Read Receipt Ready
| ✓ Attachment Ready
| ✓ Future E2EE Compatible
|
*/

export default router;