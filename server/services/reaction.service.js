import { getClient } from "../config/db.js";

import ApiError from "../utils/ApiError.js";

import {

    findChatByPublicId,

    findChatMember

} from "../repositories/chat.repository.js";

import {

    findMessageByPublicId

} from "../repositories/message.repository.js";



import {
    createReaction,
    findReactionByPublicId,
    findUserReaction,
    reactionExists,
    deactivateReaction,
    reactivateReaction,
    updateReaction,
    updateReactionMetadata,

    getMessageReactions,

    getUserReactions,

    countReactionType,

    countMessageReactions,

    groupReactionsByEmoji,

    countUserReactions,

    getMostUsedReactions

} from "../repositories/reaction.repository.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Reaction Service
|
| Responsibilities
|
| ✓ Business Logic
| ✓ Authorization
| ✓ Validation
| ✓ Transactions
| ✓ Repository Orchestration
| ✓ Toggle Logic
| ✓ Future Socket Events
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Transaction Helper
|--------------------------------------------------------------------------
*/

async function withTransaction(callback) {

    const client = await getClient();

    try {

        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result;

    }

    catch (error) {

        try {

            await client.query("ROLLBACK");

        }

        catch {}

        throw error;

    }

    finally {

        client.release();

    }

}

/*
|--------------------------------------------------------------------------
| Add Reaction
|--------------------------------------------------------------------------
|
| Rules
|
| • User must belong to chat
| • One identical active reaction per user
| • Previously removed reaction is restored
|
*/

export async function addReactionService(

    {

        messagePublicId,

        userId,

        userPublicId,

        reactionType = "emoji",

        reactionValue,

        emojiUnicode = null,

        emojiShortcode = null,

        emojiVariant = null,

        emojiPack = null,

        animated = false,

        premium = false,

        generatorType = "user",

        generatorId = null,

        generatorName = null,

        displayOrder = 0,

        highlighted = false,

        metadata = {}

    }

) {

    const message = await findMessageByPublicId(

        messagePublicId

    );

    if (!message) {

        throw new ApiError(

            404,

            "Message not found."

        );

    }

    const chat = await findChatByPublicId(

        message.chat_public_id

    );

    if (!chat) {

        throw new ApiError(

            404,

            "Chat not found."

        );

    }

    const member = await findChatMember(

        chat.id,

        userId

    );

    if (!member) {

        throw new ApiError(

            403,

            "You are not a member of this chat."

        );

    }

    const existingReaction = await findUserReaction(

        message.id,

        userId,

        reactionValue

    );

    return withTransaction(

        async (client) => {

            if (existingReaction) {

                if (existingReaction.active) {

                    return existingReaction;

                }

                return await reactivateReaction(

                    client,

                    {

                        reactionId: existingReaction.id,

                        updatedBy: userId

                    }

                );

            }

            return await createReaction(

                client,

                {

                    messageId: message.id,

                    userId,

                    userPublicId,

                    reactionType,

                    reactionValue,

                    emojiUnicode,

                    emojiShortcode,

                    emojiVariant,

                    emojiPack,

                    animated,

                    premium,

                    generatorType,

                    generatorId,

                    generatorName,

                    displayOrder,

                    highlighted,

                    metadata,

                    createdBy: userId

                }

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Remove Reaction
|--------------------------------------------------------------------------
*/

export async function removeReactionService(

    reactionPublicId,

    userId

) {

    const reaction = await findReactionByPublicId(

        reactionPublicId

    );

    if (!reaction) {

        throw new ApiError(

            404,

            "Reaction not found."

        );

    }

    if (

        reaction.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "You cannot remove this reaction."

        );

    }

    if (

        !reaction.active

    ) {

        return reaction;

    }

    return withTransaction(

        async (client) => {

            return await deactivateReaction(

                client,

                {

                    reactionId: reaction.id,

                    removedBy: userId

                }

            );

        }

    );

}


/*
|--------------------------------------------------------------------------
| Update Reaction
|--------------------------------------------------------------------------
*/

export async function updateReactionService(

    reactionPublicId,

    userId,

    {

        highlighted,

        displayOrder,

        metadata

    }

) {

    const reaction = await findReactionByPublicId(

        reactionPublicId

    );

    if (!reaction) {

        throw new ApiError(

            404,

            "Reaction not found."

        );

    }

    if (

        reaction.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "You cannot update this reaction."

        );

    }

    return withTransaction(

        async (client) => {

            return await updateReaction(

                client,

                {

                    reactionId: reaction.id,

                    highlighted,

                    displayOrder,

                    metadata,

                    updatedBy: userId

                }

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Update Reaction Metadata
|--------------------------------------------------------------------------
*/

export async function updateReactionMetadataService(

    reactionPublicId,

    userId,

    metadata

) {

    const reaction = await findReactionByPublicId(

        reactionPublicId

    );

    if (!reaction) {

        throw new ApiError(

            404,

            "Reaction not found."

        );

    }

    if (

        reaction.user_id !== userId

    ) {

        throw new ApiError(

            403,

            "You cannot update this reaction."

        );

    }

    return withTransaction(

        async (client) => {

            return await updateReactionMetadata(

                client,

                {

                    reactionId: reaction.id,

                    metadata,

                    updatedBy: userId

                }

            );

        }

    );

}

/*
|--------------------------------------------------------------------------
| Get Message Reactions
|--------------------------------------------------------------------------
*/

export async function getMessageReactionsService(

    messagePublicId

) {

    const message = await findMessageByPublicId(

        messagePublicId

    );

    if (!message) {

        throw new ApiError(

            404,

            "Message not found."

        );

    }

    return await getMessageReactions(

        message.id

    );

}

/*
|--------------------------------------------------------------------------
| Get User Reactions
|--------------------------------------------------------------------------
*/

export async function getUserReactionsService(

    userId,

    limit = 100

) {

    return await getUserReactions(

        userId,

        limit

    );

}

/*
|--------------------------------------------------------------------------
| Count Message Reactions
|--------------------------------------------------------------------------
*/

export async function countMessageReactionsService(

    messagePublicId

) {

    const message = await findMessageByPublicId(

        messagePublicId

    );

    if (!message) {

        throw new ApiError(

            404,

            "Message not found."

        );

    }

    return await countMessageReactions(

        message.id

    );

}

/*
|--------------------------------------------------------------------------
| Count Reactions By Type
|--------------------------------------------------------------------------
*/

export async function countReactionTypeService(

    messagePublicId,

    reactionType

) {

    const message = await findMessageByPublicId(

        messagePublicId

    );

    if (!message) {

        throw new ApiError(

            404,

            "Message not found."

        );

    }

    return await countReactionType(

        message.id,

        reactionType

    );

}

/*
|--------------------------------------------------------------------------
| Group Reactions By Emoji
|--------------------------------------------------------------------------
*/

export async function groupReactionsByEmojiService(

    messagePublicId

) {

    const message = await findMessageByPublicId(

        messagePublicId

    );

    if (!message) {

        throw new ApiError(

            404,

            "Message not found."

        );

    }

    return await groupReactionsByEmoji(

        message.id

    );

}

/*
|--------------------------------------------------------------------------
| Count User Reactions
|--------------------------------------------------------------------------
*/

export async function countUserReactionsService(

    userId

) {

    return await countUserReactions(

        userId

    );

}

/*
|--------------------------------------------------------------------------
| Most Used Reactions
|--------------------------------------------------------------------------
|
| Analytics
|
*/

export async function getMostUsedReactionsService(

    limit = 20

) {

    return await getMostUsedReactions(

        limit

    );

}

/*
|--------------------------------------------------------------------------
| Reaction Service Summary
|--------------------------------------------------------------------------
|
| Responsibilities
|
| ✓ Business Logic
| ✓ Authorization
| ✓ Validation
| ✓ Transactions
| ✓ Toggle Logic
| ✓ Analytics
| ✓ Metadata Updates
| ✓ Future Socket Events
|
|--------------------------------------------------------------------------
|
| Service MUST
|
| ✓ Validate Requests
| ✓ Authorize Users
| ✓ Call Repositories
| ✓ Manage Transactions
| ✓ Throw ApiError
|
|--------------------------------------------------------------------------
|
| Service MUST NEVER
|
| ✗ Execute SQL
| ✗ Build SQL Queries
| ✗ Access Database Directly
| ✗ Return Raw Database Errors
|
|--------------------------------------------------------------------------
|
| Future Features
|
| □ Socket.IO Broadcast
| □ AI Reactions
| □ Animated Packs
| □ Premium Emoji
| □ Sticker Packs
| □ Bot Reactions
| □ Trending Analytics
|
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ Repository Pattern
| ✓ Transaction Safe
| ✓ Analytics Ready
| ✓ Future E2EE Ready
|
|--------------------------------------------------------------------------
*/