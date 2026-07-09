import { Router } from "express";

import {
    createPrivateChat,
    getUserChats
} from "../../controllers/chat.controller.js";

import auth from "../../middleware/auth.middleware.js";
import { validateCreatePrivateChat } from "../../validators/chat.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Private Chats
|--------------------------------------------------------------------------
*/

/*
| POST /api/v1/chats/private
|
| Creates (or returns existing) private chat.
|
*/

router.get(
    "/",
    auth,
    getUserChats
);

router.post(
    "/private",
    auth,
    validateCreatePrivateChat,
    createPrivateChat
);

export default router;