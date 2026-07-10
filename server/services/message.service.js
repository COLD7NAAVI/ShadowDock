import ApiError from "../utils/ApiError.js";

import {

    findChatByPublicId

} from "../repositories/chat.repository.js";

import {

    createMessage,

    getMessages,

    getChatMessages,

    findMessageByPublicId,

    updateMessage,

    softDeleteMessage

} from "../repositories/message.repository.js";

/*
|--------------------------------------------------------------------------
| Create Message
|--------------------------------------------------------------------------
|
| Saves a new message inside a chat.
|
| The chat is resolved using its public UUID.
|
*/

export async function saveMessage(

    chatPublicId,

    senderId,

    {

        text,

        messageType = "text",

        metadata = {}

    }

) {

    const chat = await findChatByPublicId(

        chatPublicId

    );

    if (!chat) {

        throw new ApiError(

            404,

            "Chat not found."

        );

    }

    const message = await createMessage(

        chat.id,

        senderId,

        {

            text,

            messageType,

            metadata

        }

    );

    return message;

}

/*
|--------------------------------------------------------------------------
| Get Messages (Legacy)
|--------------------------------------------------------------------------
|
| Internal numeric chat ID.
| Kept temporarily for backward compatibility.
|
*/

export async function fetchMessages(

    chatId

) {

    return await getMessages(

        chatId

    );

}
/*
|--------------------------------------------------------------------------
| Get Chat Messages
|--------------------------------------------------------------------------
|
| Returns paginated chat history.
|
| Repository validates membership.
|
*/

export async function getChatMessagesService(

    chatPublicId,

    userId,

    limit = 50,

    before = null

) {

    return await getChatMessages(

        chatPublicId,

        userId,

        limit,

        before

    );

}

/*
|--------------------------------------------------------------------------
| Edit Message
|--------------------------------------------------------------------------
|
| Updates a previously sent message.
|
*/

export async function editMessageService(

    messagePublicId,

    senderId,

    {

        text,

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

    if (

        message.sender_id !== senderId

    ) {

        throw new ApiError(

            403,

            "You can only edit your own messages."

        );

    }

    return await updateMessage(

        message.id,

        {

            text,

            metadata

        }

    );

}
/*
|--------------------------------------------------------------------------
| Delete Message
|--------------------------------------------------------------------------
|
| Soft deletes a message.
|
*/

export async function deleteMessageService(

    messagePublicId,

    senderId

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

    if (

        message.sender_id !== senderId

    ) {

        throw new ApiError(

            403,

            "You can only delete your own messages."

        );

    }

    return await softDeleteMessage(

        message.id

    );

}