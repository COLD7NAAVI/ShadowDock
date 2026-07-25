import { Router } from "express";

import { authenticate }
    from "../../middleware/auth.middleware.js";

import {

    addReaction,

    removeReaction,

    updateReaction,

    updateReactionMetadata,

    getMessageReactions,

    getUserReactions,

    countMessageReactions,

    countReactionType,

    groupReactionsByEmoji,

    countUserReactions,

    getMostUsedReactions

} from "../../controllers/reaction.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Reaction Routes
|--------------------------------------------------------------------------
|
| Base URL
|
| /api/v1/reactions
|
*/

/*
|--------------------------------------------------------------------------
| Add Reaction
|--------------------------------------------------------------------------
|
| POST /reactions
|
*/

router.post(
    "/",
    authenticate,
    addReaction
);

/*
|--------------------------------------------------------------------------
| Remove Reaction
|--------------------------------------------------------------------------
|
| DELETE /reactions/:reactionPublicId
|
*/

router.delete(
    "/:reactionPublicId",
    authenticate,
    removeReaction
);

/*
|--------------------------------------------------------------------------
| Update Reaction
|--------------------------------------------------------------------------
|
| PATCH /reactions/:reactionPublicId
|
*/

router.patch(
    "/:reactionPublicId",
    authenticate,
    updateReaction
);

/*
|--------------------------------------------------------------------------
| Update Reaction Metadata
|--------------------------------------------------------------------------
|
| PATCH /reactions/:reactionPublicId/metadata
|
*/

router.patch(
    "/:reactionPublicId/metadata",
    authenticate,
    updateReactionMetadata
);

/*
|--------------------------------------------------------------------------
| Get Message Reactions
|--------------------------------------------------------------------------
|
| GET /reactions/message/:messagePublicId
|
*/

router.get(
    "/message/:messagePublicId",
    authenticate,
    getMessageReactions
);

/*
|--------------------------------------------------------------------------
| Count Message Reactions
|--------------------------------------------------------------------------
|
| GET /reactions/message/:messagePublicId/count
|
*/

router.get(
    "/message/:messagePublicId/count",
    authenticate,
    countMessageReactions
);

/*
|--------------------------------------------------------------------------
| Count Reaction Type
|--------------------------------------------------------------------------
|
| GET /reactions/message/:messagePublicId/type/:reactionType
|
*/

router.get(
    "/message/:messagePublicId/type/:reactionType",
    authenticate,
    countReactionType
);

/*
|--------------------------------------------------------------------------
| Group Reactions By Emoji
|--------------------------------------------------------------------------
|
| GET /reactions/message/:messagePublicId/grouped
|
*/

router.get(
    "/message/:messagePublicId/grouped",
    authenticate,
    groupReactionsByEmoji
);

/*
|--------------------------------------------------------------------------
| User Reactions
|--------------------------------------------------------------------------
|
| GET /reactions/user
|
*/

router.get(
    "/user",
    authenticate,
    getUserReactions
);

/*
|--------------------------------------------------------------------------
| User Reaction Count
|--------------------------------------------------------------------------
|
| GET /reactions/user/count
|
*/

router.get(
    "/user/count",
    authenticate,
    countUserReactions
);

/*
|--------------------------------------------------------------------------
| Most Used Reactions
|--------------------------------------------------------------------------
|
| GET /reactions/analytics/most-used
|
*/

router.get(
    "/analytics/most-used",
    authenticate,
    getMostUsedReactions
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
| ✓ Future E2EE Compatible
|
*/

export default router;