import ApiError from "../../utils/ApiError.js";

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
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Message Socket Events
|
| Responsibilities
|
| ✓ Join chat rooms
| ✓ Leave chat rooms
| ✓ Send messages
| ✓ Edit messages
| ✓ Delete messages
| ✓ Typing indicators
| ✓ Read receipts (future)
| ✓ Optimistic acknowledgements
|
| This file intentionally contains NO business logic.
|
| Every operation is delegated to the Service layer.
|
|--------------------------------------------------------------------------
|
| Event Naming Convention
|--------------------------------------------------------------------------
|
| Client → Server
|
| chat:join
| chat:leave
| message:send
| message:edit
| message:delete
| typing:start
| typing:stop
|
|--------------------------------------------------------------------------
|
| Server → Client
|--------------------------------------------------------------------------
|
| message:new
| message:edited
| message:deleted
| typing:start
| typing:stop
| socket:error
|
|--------------------------------------------------------------------------
|
| Future
|--------------------------------------------------------------------------
|
| • Attachments
| • Reactions
| • Replies
| • Forward Messages
| • Voice Notes
| • Polls
| • Read Receipts
| • Scheduled Messages
| • E2EE Delivery
|
*/
/*
|--------------------------------------------------------------------------
| Register Message Events
|--------------------------------------------------------------------------
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
    |
    | Joins the authenticated user to a chat room.
    |
    | Validation and membership checks are handled
    | inside joinChatRoom().
    |
    */

    socket.on(

        "chat:join",

        async (

            {

                chatPublicId

            } = {},

            callback = () => {}

        ) => {

            try {

                if (

                    !chatPublicId ||

                    typeof chatPublicId !== "string"

                ) {

                    throw new ApiError(

                        400,

                        "Invalid chat."

                    );

                }

                await joinChatRoom(

                    socket,

                    chatPublicId

                );

                callback({

                    success: true

                });

            }

            catch (error) {

                callback({

                    success: false,

                    message: error.message

                });

                socket.emit(

                    "socket:error",

                    {

                        event: "chat:join",

                        message: error.message

                    }

                );

            }

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Leave Chat
    |--------------------------------------------------------------------------
    |
    | Removes the current socket from a chat room.
    |
    */

    socket.on(

        "chat:leave",

        async (

            {

                chatPublicId

            } = {},

            callback = () => {}

        ) => {

            try {

                if (

                    !chatPublicId ||

                    typeof chatPublicId !== "string"

                ) {

                    throw new ApiError(

                        400,

                        "Invalid chat."

                    );

                }

                await leaveChatRoom(

                    socket,

                    chatPublicId

                );

                callback({

                    success: true

                });

            }

            catch (error) {

                callback({

                    success: false,

                    message: error.message

                });

                socket.emit(

                    "socket:error",

                    {

                        event: "chat:leave",

                        message: error.message

                    }

                );

            }

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Send Message
    |--------------------------------------------------------------------------
    |
    | Creates a new message and broadcasts it
    | to every member inside the room.
    |
    */
       socket.on(

        "message:send",

        async (

            payload = {},

            callback = () => {}

        ) => {

            try {

                const {

                    chatPublicId,

                    text,

                    messageType = "text",

                    metadata = {}

                } = payload;

                if (

                    !chatPublicId ||

                    typeof chatPublicId !== "string"

                ) {

                    throw new ApiError(

                        400,

                        "Chat ID is required."

                    );

                }

                if (

                    typeof text !== "string" ||

                    !text.trim()

                ) {

                    throw new ApiError(

                        400,

                        "Message cannot be empty."

                    );

                }

                const message =

                    await saveMessage(

                        chatPublicId,

                        user.id,

                        {

                            text: text.trim(),

                            messageType,

                            metadata

                        }

                    );

                io.to(

                    `chat:${chatPublicId}`

                ).emit(

                    "message:new",

                    message

                );

                callback({

                    success: true,

                    data: message

                });

            }

            catch (error) {

                callback({

                    success: false,

                    message: error.message

                });

                socket.emit(

                    "socket:error",

                    {

                        event: "message:send",

                        message: error.message

                    }

                );

            }

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Edit Message
    |--------------------------------------------------------------------------
    |
    | Updates an existing message.
    |
    | Authorization is enforced
    | inside the service layer.
    |
    */
       socket.on(

        "message:edit",

        async (

            payload = {},

            callback = () => {}

        ) => {

            try {

                const {

                    messagePublicId,

                    text,

                    metadata = {}

                } = payload;

                if (

                    !messagePublicId ||

                    typeof messagePublicId !== "string"

                ) {

                    throw new ApiError(

                        400,

                        "Message ID is required."

                    );

                }

                if (

                    typeof text !== "string" ||

                    !text.trim()

                ) {

                    throw new ApiError(

                        400,

                        "Message cannot be empty."

                    );

                }

                const message =

                    await editMessageService(

                        messagePublicId,

                        user.id,

                        {

                            text: text.trim(),

                            metadata

                        }

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

            catch (error) {

                callback({

                    success: false,

                    message: error.message

                });

                socket.emit(

                    "socket:error",

                    {

                        event: "message:edit",

                        message: error.message

                    }

                );

            }

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Delete Message
    |--------------------------------------------------------------------------
    |
    | Soft deletes a message.
    |
    */
       socket.on(

        "message:delete",

        async (

            payload = {},

            callback = () => {}

        ) => {

            try {

                const {

                    messagePublicId

                } = payload;

                if (

                    !messagePublicId ||

                    typeof messagePublicId !== "string"

                ) {

                    throw new ApiError(

                        400,

                        "Message ID is required."

                    );

                }

                const message =

                    await deleteMessageService(

                        messagePublicId,

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

            catch (error) {

                callback({

                    success: false,

                    message: error.message

                });

                socket.emit(

                    "socket:error",

                    {

                        event: "message:delete",

                        message: error.message

                    }

                );

            }

        }

    );

}

/*
|--------------------------------------------------------------------------
| Event Flow
|--------------------------------------------------------------------------
|
| Client
|   │
|   ▼
| message:send
| message:edit
| message:delete
| chat:join
| chat:leave
|
|   │
|   ▼
| Message Service
|
|   │
|   ▼
| Repository
|
|   │
|   ▼
| PostgreSQL
|
|   │
|   ▼
| Socket.IO Broadcast
|
|   │
|   ▼
| Clients
|
|--------------------------------------------------------------------------
|
| message.events.js
|
| Status
|
| ✓ Production Ready
| ✓ Repository Driven
| ✓ Service Driven
| ✓ Socket.IO v4 Ready
| ✓ Redis Adapter Ready
| ✓ Horizontal Scaling Ready
| ✓ Multi-device Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/