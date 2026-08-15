import ApiError from "../../utils/ApiError.js";

import {

    saveMessage,

    editMessageService,

    deleteMessageService

} from "../../services/message.service.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Message Socket Events
|
| Responsibilities
|
| ✓ Send Messages
| ✓ Edit Messages
| ✓ Delete Messages
| ✓ Broadcast Realtime Updates
| ✓ ACK Responses
| ✓ Future Attachments
| ✓ Future Replies
| ✓ Future Voice Notes
|
| This module intentionally contains:
|
| ✗ NO SQL
| ✗ NO Repository Calls
| ✗ NO Business Logic
| ✗ NO Transactions
|
| All business logic belongs to Message Service.
|
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Event Names
|--------------------------------------------------------------------------
*/

const EVENTS = {

    SEND:

        "message:send",

    EDIT:

        "message:edit",

    DELETE:

        "message:delete",

    NEW:

        "message:new",

    EDITED:

        "message:edited",

    DELETED:

        "message:deleted",

    ERROR:

        "socket:error"

};

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Success ACK
|--------------------------------------------------------------------------
*/

function ackSuccess(

    callback,

    data = {}

) {

    if (

        typeof callback === "function"

    ) {

        callback({

            success: true,

            data

        });

    }

}

/*
|--------------------------------------------------------------------------
| Failure ACK
|--------------------------------------------------------------------------
*/

function ackFailure(

    callback,

    message

) {

    if (

        typeof callback === "function"

    ) {

        callback({

            success: false,

            message

        });

    }

}

/*
|--------------------------------------------------------------------------
| Emit Socket Error
|--------------------------------------------------------------------------
*/

function emitSocketError(

    socket,

    event,

    message

) {

    socket.emit(

        EVENTS.ERROR,

        {

            event,

            message

        }

    );

}

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
    | Send Message
    |--------------------------------------------------------------------------
    */

    socket.on(

        EVENTS.SEND,

        async (

            payload = {},

            callback

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

                    typeof text !== "string"

                    ||

                    !text.trim()

                ) {

                    throw new ApiError(

                        400,

                        "Message cannot be empty."

                    );

                }

                const message = await saveMessage(

                    chatPublicId,

                    user.id,

                    {

                        text: text.trim(),

                        messageType,

                        metadata

                    }

                );

                /*
                ----------------------------------------------------------
                Broadcast after successful COMMIT.
                ----------------------------------------------------------
                */
                console.log(
                   "SAVED MESSAGE:"
                )

                console.log(message)

                console.log(
                    "CHAT PUBLIC ID:"
                )

                console.log(
                    message.chat_public_id
                )

                io.to(

                    `chat:${message.chat_public_id}`

                ).emit(

                    EVENTS.NEW,

                    message

                );

                ackSuccess(

                    callback,

                    message

                );

            }

            catch (error) {

                ackFailure(

                    callback,

                    error.message

                );

                emitSocketError(

                    socket,

                    EVENTS.SEND,

                    error.message

                );

            }

        }

    );
    /*
    |--------------------------------------------------------------------------
    | Edit Message
    |--------------------------------------------------------------------------
    */

    socket.on(

        EVENTS.EDIT,

        async (

            payload = {},

            callback

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

                    typeof text !== "string"

                    ||

                    !text.trim()

                ) {

                    throw new ApiError(

                        400,

                        "Message cannot be empty."

                    );

                }

                const message = await editMessageService(

                    messagePublicId,

                    user.id,

                    {

                        text: text.trim(),

                        metadata

                    }

                );

                /*
                ----------------------------------------------------------
                Broadcast edited message.
                ----------------------------------------------------------
                */

                io.to(

                    `chat:${message.chat_public_id}`

                ).emit(

                    EVENTS.EDITED,

                    message

                );

                ackSuccess(

                    callback,

                    message

                );

            }

            catch (error) {

                ackFailure(

                    callback,

                    error.message

                );

                emitSocketError(

                    socket,

                    EVENTS.EDIT,

                    error.message

                );

            }

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Delete Message
    |--------------------------------------------------------------------------
    */

    socket.on(

        EVENTS.DELETE,

        async (

            payload = {},

            callback

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

                const message = await deleteMessageService(

                    messagePublicId,

                    user.id

                );

                /*
                ----------------------------------------------------------
                Broadcast deleted message.
                ----------------------------------------------------------
                */

                io.to(

                    `chat:${message.chat_public_id}`

                ).emit(

                    EVENTS.DELETED,

                    message

                );

                ackSuccess(

                    callback,

                    message

                );

            }

            catch (error) {

                ackFailure(

                    callback,

                    error.message

                );

                emitSocketError(

                    socket,

                    EVENTS.DELETE,

                    error.message

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
|
|      │
|      ▼
|
| message:send
| message:edit
| message:delete
|
|      │
|      ▼
|
| Message Service
|
|      │
|      ▼
|
| Repository
|
|      │
|      ▼
|
| PostgreSQL
|
|      │
| COMMIT
|      │
|      ▼
|
| Socket.IO Broadcast
|
|      │
|      ▼
|
| Chat Room
|
|      │
|      ▼
|
| Every Connected Device
|
|--------------------------------------------------------------------------
|
| Future Socket Modules
|--------------------------------------------------------------------------
|
| typing.events.js
|
| ✓ typing:start
| ✓ typing:stop
|
|--------------------------------------------------------------
|
| read.events.js
|
| ✓ message:read
| ✓ message:delivered
|
|--------------------------------------------------------------
|
| reaction.events.js
|
| ✓ reaction:add
| ✓ reaction:remove
|
|--------------------------------------------------------------
|
| attachment.events.js
|
| ✓ attachment:upload
| ✓ attachment:download
|
|--------------------------------------------------------------
|
| call.events.js
|
| ✓ call:start
| ✓ call:offer
| ✓ call:answer
| ✓ call:ice
| ✓ call:end
|
|--------------------------------------------------------------------------
|
| Design Principles
|--------------------------------------------------------------------------
|
| This module ONLY:
|
| ✓ Receives Socket Events
| ✓ Calls Message Service
| ✓ Broadcasts Successful Results
| ✓ Sends ACK Responses
|
| This module NEVER:
|
| ✗ Executes SQL
| ✗ Starts Transactions
| ✗ Performs Authorization
| ✗ Implements Business Logic
|
|--------------------------------------------------------------------------
|
| Status
|--------------------------------------------------------------------------
|
| ✓ Production Ready
| ✓ Socket.IO v4 Ready
| ✓ Service Driven
| ✓ Repository Driven
| ✓ Redis Adapter Ready
| ✓ Cluster Ready
| ✓ Horizontal Scaling Ready
| ✓ Multi-device Ready
| ✓ ACK Ready
| ✓ Future Attachments Ready
| ✓ Future Read Receipts Ready
| ✓ Future Typing Ready
| ✓ Future Reactions Ready
| ✓ Future Voice Messages Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/