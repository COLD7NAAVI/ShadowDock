import api from "./api.js";

/*
|--------------------------------------------------------------------------
| Normalize message
|--------------------------------------------------------------------------
|
| Backend currently exposes public_id, sender_public_id,
| content, created_at, etc.
|
| The normalizer also accepts older field names so frontend
| evolution does not break the UI.
|
|--------------------------------------------------------------------------
*/

export function normalizeMessage(

    message

) {

    if (!message) {

        return null;

    }

    return {

        id:
            message.public_id ??
            message.publicId ??
            message.id,

        publicId:
            message.public_id ??
            message.publicId ??
            message.id,

        chatPublicId:
            message.chat_public_id ??
            message.chatPublicId,

        senderPublicId:
            message.sender_public_id ??
            message.senderPublicId,

        senderUsername:
            message.username ??
            message.sender_username ??
            "",

        senderDisplayName:
            message.display_name ??
            message.sender_display_name ??
            "",

        senderAvatar:
            message.sender_avatar ??
            message.avatar ??
            null,

        text:
            message.content ??
            message.text ??
            "",

        messageType:
            message.message_type ??
            message.messageType ??
            "text",

        metadata:
            message.metadata ??
            {},

        deliveryStatus:
            message.delivery_status ??
            "sent",

        edited:
            Boolean(
                message.edited ??
                message.is_edited
            ),

        deleted:
            Boolean(
                message.deleted_at ??
                message.is_deleted
            ),

        createdAt:
            message.created_at ??
            message.createdAt ??
            new Date().toISOString(),

        updatedAt:
            message.updated_at ??
            message.updatedAt ??
            null,

    };

}

/*
|--------------------------------------------------------------------------
| Get chat history
|--------------------------------------------------------------------------
*/

export async function getChatMessages(

    chatPublicId

) {

    const response = await api.get(

        `/messages/chat/${encodeURIComponent(
            chatPublicId
        )}`,

        {

            params: {

                limit: 50,

            },

        }

    );

    const messages =
        response.data?.data || [];

    /*
    Backend currently returns newest-first.
    UI displays oldest → newest.
    */

    return messages

        .map(normalizeMessage)

        .filter(Boolean)

        .reverse();

}

/*
|--------------------------------------------------------------------------
| HTTP fallback send
|--------------------------------------------------------------------------
|
| Useful if Socket.IO is temporarily unavailable.
|
|--------------------------------------------------------------------------
*/

export async function sendMessageHttp({

    chatPublicId,

    text,

    messageType = "text",

    metadata = {},

}) {

    const response = await api.post(

        "/messages",

        {

            chatPublicId,

            text,

            messageType,

            metadata,

        }

    );

    return normalizeMessage(

        response.data?.data

    );

}