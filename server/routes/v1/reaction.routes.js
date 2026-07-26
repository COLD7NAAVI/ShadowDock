import { Router } from "express";

import auth
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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
    auth,
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