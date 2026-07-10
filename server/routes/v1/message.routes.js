import { Router } from "express";

import auth from "../../middleware/auth.middleware.js";

import {

    sendMessage,

    getMessages,

    getChatMessages,

    editMessage,

    deleteMessage

} from "../../controllers/message.controller.js";

const router = Router();

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
| Legacy Messages
|--------------------------------------------------------------------------
|
| GET /api/v1/messages/:chatId
|
| Uses the internal numeric chat ID.
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
| Query Parameters
|
| ?limit=50
| ?before=2026-07-09T12:00:00Z
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
| PATCH /api/v1/messages/:messagePublicId
|
| Body
|
| {
|     text,
|     metadata
| }
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
| Soft deletes a message.
|
*/

router.delete(

    "/:messagePublicId",

    auth,

    deleteMessage

);

export default router;