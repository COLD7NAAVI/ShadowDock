import {
    createMessage,
    getMessages,
    getChatMessages
} from "../repositories/message.repository.js";

/*
|--------------------------------------------------------------------------
| Create Message
|--------------------------------------------------------------------------
|
| Saves a new message to a chat.
|
*/

export async function saveMessage(
    chatId,
    senderId,
    text
) {
    const message = await createMessage(
        chatId,
        senderId,
        text
    );

    return message;
}

/*
|--------------------------------------------------------------------------
| Get Messages (Legacy)
|--------------------------------------------------------------------------
|
| Returns all messages for a chat using the internal chat ID.
| Kept for backward compatibility.
|
*/

export async function fetchMessages(
    chatId
) {
    const messages = await getMessages(chatId);

    return messages;
}

/*
|--------------------------------------------------------------------------
| Get Chat Messages
|--------------------------------------------------------------------------
|
| Returns paginated messages using the public chat ID.
| Ensures the requesting user is a member of the chat.
|
*/

export async function getChatMessagesService(
    chatPublicId,
    userId,
    limit = 50,
    before = null
) {
    const messages = await getChatMessages(
        chatPublicId,
        userId,
        limit,
        before
    );

    return messages;
}