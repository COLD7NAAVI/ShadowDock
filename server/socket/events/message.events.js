import {
    saveMessage,
    editMessageService,
    deleteMessageService
} from "../../services/message.service.js";

import {
    joinChatRoom,
    leaveChatRoom
} from "../rooms.js";

/*
|--------------------------------------------------------------------------
| Message Events
|--------------------------------------------------------------------------
|
| Registers every message-related Socket.IO event.
|
| Handles:
|
| • Join Chat
| • Leave Chat
| • Send Message
| • Edit Message
| • Delete Message
|
| Future:
|
| • Attachments
| • Reactions
| • Replies
| • Forwarding
| • Pins
| • Read Receipts
|
*/

export default function registerMessageEvents(

    io,

    socket

) {

    const user = socket.user;

    /*
    |--------------------------------------------------------------------------
    | Join Chat
    |--------------------------------------------------------------------------
    */

    socket.on(

        "chat:join",

        async (

            {

                chatPublicId

            } = {}

        ) => {

            try {

                if (!chatPublicId) {

                    return;

                }

                await joinChatRoom(

                    socket,

                    chatPublicId

                );

            }

            catch (err) {

                socket.emit(

                    "socket:error",

                    {

                        event: "chat:join",

                        message: err.message

                    }

                );

            }

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Leave Chat
    |--------------------------------------------------------------------------
    */

    socket.on(

        "chat:leave",

        async (

            {

                chatPublicId

            } = {}

        ) => {

            try {

                if (!chatPublicId) {

                    return;

                }

                await leaveChatRoom(

                    socket,

                    chatPublicId

                );

            }

            catch (err) {

                socket.emit(

                    "socket:error",

                    {

                        event: "chat:leave",

                        message: err.message

                    }

                );

            }

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Send Message
    |--------------------------------------------------------------------------
    */

    socket.on(

        "message:send",

        async (

            payload = {},

            callback = () => {}

        ) => {

            try {

                const {

                    chatId,

                    text

                } = payload;

                if (

                    !chatId ||

                    !text ||

                    !text.trim()

                ) {

                    return callback({

                        success: false,

                        message: "Invalid message."

                    });

                }

                const message =

                    await saveMessage(

                        chatId,

                        user.id,

                        text.trim()

                    );

                io.to(

                    `chat:${chatId}`

                ).emit(

                    "message:new",

                    message

                );

                callback({

                    success: true,

                    data: message

                });

            }

            catch (err) {

                callback({

                    success: false,

                    message: err.message

                });

            }

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Edit Message
    |--------------------------------------------------------------------------
    */

    socket.on(

        "message:edit",

        async (

            payload = {},

            callback = () => {}

        ) => {

            try {

                const {

                    messageId,

                    text

                } = payload;

                const message =

                    await editMessageService(

                        messageId,

                        user.id,

                        text

                    );

                io.to(

                    `chat:${message.chat_public_id}`

                ).emit(

                    "message:edited",

                    message

                );

                callback({

                    success: true,

                    data: message

                });

            }

            catch (err) {

                callback({

                    success: false,

                    message: err.message

                });

            }

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Delete Message
    |--------------------------------------------------------------------------
    */

    socket.on(

        "message:delete",

        async (

            payload = {},

            callback = () => {}

        ) => {

            try {

                const {

                    messageId

                } = payload;

                const message =

                    await deleteMessageService(

                        messageId,

                        user.id

                    );

                io.to(

                    `chat:${message.chat_public_id}`

                ).emit(

                    "message:deleted",

                    message

                );

                callback({

                    success: true,

                    data: message

                });

            }

            catch (err) {

                callback({

                    success: false,

                    message: err.message

                });

            }

        }

    );

}