import asyncHandler from "../utils/asyncHandler.js";

import {

    addReactionService,

    removeReactionService,

    updateReactionService,

    updateReactionMetadataService,

    getMessageReactionsService,

    getUserReactionsService,

    countMessageReactionsService,

    countReactionTypeService,

    groupReactionsByEmojiService,

    countUserReactionsService,

    getMostUsedReactionsService

} from "../services/reaction.service.js";

/*
|--------------------------------------------------------------------------
| Reaction Controller
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Add reactions
| ✓ Remove reactions
| ✓ Update reactions
| ✓ Metadata updates
| ✓ Analytics endpoints
|
| Business logic belongs in Reaction Service.
|
*/

/*
|--------------------------------------------------------------------------
| Add Reaction
|--------------------------------------------------------------------------
|
| POST /api/v1/reactions
|
*/

export const addReaction =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const reaction =

                await addReactionService({

                    ...req.body,

                    userId: req.user.id,

                    userPublicId: req.user.publicId

                });

            return res

                .status(201)

                .json({

                    success: true,

                    message:

                        "Reaction added successfully.",

                    data: reaction

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Remove Reaction
|--------------------------------------------------------------------------
*/

export const removeReaction =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const reaction =

                await removeReactionService(

                    req.params.reactionPublicId,

                    req.user.id

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Reaction removed successfully.",

                    data: reaction

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Update Reaction
|--------------------------------------------------------------------------
*/

export const updateReaction =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const reaction =

                await updateReactionService(

                    req.params.reactionPublicId,

                    req.user.id,

                    req.body

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Reaction updated successfully.",

                    data: reaction

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Update Reaction Metadata
|--------------------------------------------------------------------------
*/

export const updateReactionMetadata =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const reaction =

                await updateReactionMetadataService(

                    req.params.reactionPublicId,

                    req.user.id,

                    req.body

                );

            return res

                .status(200)

                .json({

                    success: true,

                    message:

                        "Reaction metadata updated successfully.",

                    data: reaction

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Get Message Reactions
|--------------------------------------------------------------------------
*/

export const getMessageReactions =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const reactions =

                await getMessageReactionsService(

                    req.params.messagePublicId

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: reactions

                });

        }

    );
/*
|--------------------------------------------------------------------------
| Get User Reactions
|--------------------------------------------------------------------------
*/

export const getUserReactions =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const {

                limit = 100

            } = req.query;

            const reactions =

                await getUserReactionsService(

                    req.user.id,

                    Number(limit)

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: reactions

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Count Message Reactions
|--------------------------------------------------------------------------
*/

export const countMessageReactions =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const total =

                await countMessageReactionsService(

                    req.params.messagePublicId

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: {

                        total

                    }

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Count Reaction Type
|--------------------------------------------------------------------------
*/

export const countReactionType =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const total =

                await countReactionTypeService(

                    req.params.messagePublicId,

                    req.params.reactionType

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: {

                        total

                    }

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Group Reactions By Emoji
|--------------------------------------------------------------------------
*/

export const groupReactionsByEmoji =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const reactions =

                await groupReactionsByEmojiService(

                    req.params.messagePublicId

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: reactions

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Count User Reactions
|--------------------------------------------------------------------------
*/

export const countUserReactions =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const total =

                await countUserReactionsService(

                    req.user.id

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: {

                        total

                    }

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Most Used Reactions
|--------------------------------------------------------------------------
*/

export const getMostUsedReactions =

    asyncHandler(

        async (

            req,

            res

        ) => {

            const {

                limit = 20

            } = req.query;

            const reactions =

                await getMostUsedReactionsService(

                    Number(limit)

                );

            return res

                .status(200)

                .json({

                    success: true,

                    data: reactions

                });

        }

    );

/*
|--------------------------------------------------------------------------
| Reaction Controller
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Parse HTTP Requests
| ✓ Invoke Reaction Service
| ✓ Format HTTP Responses
| ✓ Throw Errors Through asyncHandler
|
|--------------------------------------------------------------------------
|
| Controller MUST NEVER
|
| ✗ Execute SQL
| ✗ Access Database
| ✗ Apply Business Logic
| ✗ Modify Repository Data Directly
|
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ Thin Controller
| ✓ Service Driven
| ✓ Repository Pattern
| ✓ Transaction Ready
| ✓ Analytics Ready
| ✓ Socket.IO Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/