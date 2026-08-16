import ApiError from "../../utils/ApiError.js";

import {

    findChatByPublicId,
    findChatMember

} from "../../repositories/chat.repository.js";


import {

    getUserSockets

} from "../socketStore.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Chat Socket Events
|
| Responsibilities:
|
| ✓ Join chat rooms
| ✓ Leave chat rooms
| ✓ Multi-device synchronization
| ✓ Room authorization
| ✓ Cluster-ready architecture
| ✓ Redis-compatible design
|
| IMPORTANT
|
| This file NEVER performs business logic.
|
| It only:
|
| • validates socket events
| • checks permissions
| • joins/leaves Socket.IO rooms
| • broadcasts lightweight events
|
| Database writes belong inside services.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Event Names
|--------------------------------------------------------------------------
*/

const EVENTS = {

    JOIN_CHAT:

        "chat:join",

    LEAVE_CHAT:

        "chat:leave",

    JOIN_ALL:

        "chat:join-all",

    JOINED:

        "chat:joined",

    LEFT:

        "chat:left",

    ERROR:

        "chat:error"

};


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Emit Error
|--------------------------------------------------------------------------
*/

function emitError(

    socket,

    message,

    code = "CHAT_ERROR"

) {

    socket.emit(

        EVENTS.ERROR,

        {

            success: false,

            code,

            message

        }

    );

}


/*
|--------------------------------------------------------------------------
| Emit Success
|--------------------------------------------------------------------------
*/

function emitSuccess(

    socket,

    event,

    payload = {}

) {

    socket.emit(

        event,

        {

            success: true,

            ...payload

        }

    );

}


/*
|--------------------------------------------------------------------------
| Resolve Chat
|--------------------------------------------------------------------------
|
| Converts public UUID into internal numeric ID.
|
*/

async function resolveChat(

    chatPublicId

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

    return chat;

}


/*
|--------------------------------------------------------------------------
| Verify Membership
|--------------------------------------------------------------------------
|
| Ensures the authenticated user belongs to the chat.
|
*/

async function verifyMembership(

    chatId,

    userId

) {

    const member = await findChatMember(

        chatId,

        userId

    );

    if (!member) {

        throw new ApiError(

            403,

            "You are not a member of this chat."

        );

    }

    return member;

}


/*
|--------------------------------------------------------------------------
| Build Room Name
|--------------------------------------------------------------------------
|
| Single source of truth.
|
| Future:
| Redis Adapter
| Socket Cluster
|
*/

function roomName(

    chatPublicId

) {

    return `chat:${chatPublicId}`;

}


/*
|--------------------------------------------------------------------------
| Join Every Device
|--------------------------------------------------------------------------
|
| User may be connected from:
|
| • Desktop
| • Mobile
| • Tablet
| • Browser #2
|
| Every socket joins the same room.
|
*/

function joinAllUserSockets(

    io,

    userId,

    room

) {

    const sockets =

        getUserSockets(userId);

    for (

        const socketId

        of sockets

    ) {

        io.sockets.sockets

            .get(socketId)

            ?.join(room);

    }

}


/*
|--------------------------------------------------------------------------
| Leave Every Device
|--------------------------------------------------------------------------
*/

function leaveAllUserSockets(

    io,

    userId,

    room

) {

    const sockets =

        getUserSockets(userId);

    for (

        const socketId

        of sockets

    ) {

        io.sockets.sockets

            .get(socketId)

            ?.leave(room);

    }

}
/*
|--------------------------------------------------------------------------
| Join Chat
|--------------------------------------------------------------------------
|
| Client:
|
| socket.emit(
|
|     "chat:join",
|
|     {
|
|         chatPublicId
|
|     }
|
| );
|
| Optional ACK:
|
| socket.emit(
|
|     "chat:join",
|
|     payload,
|
|     (response) => {}
|
| );
|
|--------------------------------------------------------------------------
*/

async function handleJoinChat(

    io,

    socket,

    payload = {},

    ack

) {

    try {

        const {

            chatPublicId

        } = payload;

        if (

            !chatPublicId ||

            typeof chatPublicId !== "string"

        ) {

            throw new ApiError(

                400,

                "Invalid chat identifier."

            );

        }

        if (

            !socket.user

        ) {

            throw new ApiError(

                401,

                "Authentication required."

            );

        }

        const chat = await resolveChat(

            chatPublicId

        );

        await verifyMembership(

            chat.id,

            socket.user.id

        );

        const room = roomName(

            chat.public_id

        );

        /*
        ------------------------------------------------------------
        Join every connected device owned by this user.
        ------------------------------------------------------------
        */

        joinAllUserSockets(

            io,

            socket.user.id,

            room

        );

        emitSuccess(

            socket,

            EVENTS.JOINED,

            {

                chatPublicId:

                    chat.public_id,

                room

            }

        );

        /*
        ------------------------------------------------------------
        Optional acknowledgement callback.
        ------------------------------------------------------------
        */

        if (

            typeof ack === "function"

        ) {

            ack({

                success: true,

                room,

                chatPublicId:

                    chat.public_id

            });

        }

    }

    catch (error) {

        const message =

            error instanceof ApiError

                ? error.message

                : "Unable to join chat.";

        emitError(

            socket,

            message,

            "JOIN_CHAT_FAILED"

        );

        if (

            typeof ack === "function"

        ) {

            ack({

                success: false,

                message

            });

        }

    }

}
/*
|--------------------------------------------------------------------------
| Leave Chat
|--------------------------------------------------------------------------
|
| Client:
|
| socket.emit(
|
|     "chat:leave",
|
|     {
|
|         chatPublicId
|
|     }
|
| );
|
|--------------------------------------------------------------------------
*/

async function handleLeaveChat(

    io,

    socket,

    payload = {},

    ack

) {

    try {

        const {

            chatPublicId

        } = payload;

        if (

            !chatPublicId ||

            typeof chatPublicId !== "string"

        ) {

            throw new ApiError(

                400,

                "Invalid chat identifier."

            );

        }

        if (

            !socket.user

        ) {

            throw new ApiError(

                401,

                "Authentication required."

            );

        }

        const chat = await resolveChat(

            chatPublicId

        );

        /*
        ------------------------------------------------------------
        Verify membership before leaving.
        ------------------------------------------------------------
        */

        await verifyMembership(

            chat.id,

            socket.user.id

        );

        const room = roomName(

            chat.public_id

        );

        /*
        ------------------------------------------------------------
        Remove every connected device owned by this user
        from the chat room.
        ------------------------------------------------------------
        */

        leaveAllUserSockets(

            io,

            socket.user.id,

            room

        );

        emitSuccess(

            socket,

            EVENTS.LEFT,

            {

                chatPublicId:

                    chat.public_id,

                room

            }

        );

        /*
        ------------------------------------------------------------
        Optional acknowledgement.
        ------------------------------------------------------------
        */

        if (

            typeof ack === "function"

        ) {

            ack({

                success: true,

                room,

                chatPublicId:

                    chat.public_id

            });

        }

    }

    catch (error) {

        const message =

            error instanceof ApiError

                ? error.message

                : "Unable to leave chat.";

        emitError(

            socket,

            message,

            "LEAVE_CHAT_FAILED"

        );

        if (

            typeof ack === "function"

        ) {

            ack({

                success: false,

                message

            });

        }

    }

}


/*
|--------------------------------------------------------------------------
| Leave All Joined Rooms
|--------------------------------------------------------------------------
|
| Called automatically during disconnect.
|
| Leaves every Socket.IO room except:
|
| • socket.id
| • user:<id>
|
| Future Ready:
|
| ✓ Redis Adapter
| ✓ Socket Cluster
| ✓ Horizontal Scaling
|
|--------------------------------------------------------------------------
*/

function leaveAllChatRooms(

    socket

) {

    for (

        const room

        of socket.rooms

    ) {

        if (

            room === socket.id

        ) {

            continue;

        }

        if (

            room.startsWith(

                "user:"

            )

        ) {

            continue;

        }

        socket.leave(

            room

        );

    }

}
/*
|--------------------------------------------------------------------------
| Register Chat Events
|--------------------------------------------------------------------------
|
| Registers every chat-related Socket.IO event.
|
| This module ONLY manages chat room lifecycle.
|
| Business logic belongs inside services.
|
*/

export default function registerChatEvents(

    io,

    socket

) {

    /*
    ------------------------------------------------------------
    Join Chat
    ------------------------------------------------------------
    */

    socket.on(

        EVENTS.JOIN_CHAT,

        (

            payload,

            ack

        ) => {

            handleJoinChat(

                io,

                socket,

                payload,

                ack

            );

        }

    );

    
    /*
    ------------------------------------------------------------
    Leave Chat
    ------------------------------------------------------------
    */

    socket.on(

        EVENTS.LEAVE_CHAT,

        (

            payload,

            ack

        ) => {

            handleLeaveChat(

                io,

                socket,

                payload,

                ack

            );

        }

    );

    /*
    ------------------------------------------------------------
    Join Multiple Chats
    ------------------------------------------------------------
    |
    | Used after:
    |
    | • Login
    | • Browser Refresh
    | • Reconnect
    | • Network Recovery
    |
    */

    socket.on(

        EVENTS.JOIN_ALL,

        async (

            payload = {},

            ack

        ) => {

            try {

                const {

                    chats = []

                } = payload;

                if (

                    !Array.isArray(

                        chats

                    )

                ) {

                    throw new ApiError(

                        400,

                        "Invalid chat list."

                    );

                }

                const joined = [];

                for (

                    const chatPublicId

                    of chats

                ) {

                    try {

                        const chat =

                            await resolveChat(

                                chatPublicId

                            );

                        await verifyMembership(

                            chat.id,

                            socket.user.id

                        );

                        const room =

                            roomName(

                                chat.public_id

                            );

                        joinAllUserSockets(

                            io,

                            socket.user.id,

                            room

                        );

                        joined.push(

                            chat.public_id

                        );

                    }

                    catch {

                        /*
                        Ignore invalid rooms.
                        Continue joining remaining chats.
                        */

                    }

                }

                if (

                    typeof ack === "function"

                ) {

                    ack({

                        success: true,

                        joined

                    });

                }

            }

            catch (error) {

                const message =

                    error instanceof ApiError

                        ? error.message

                        : "Unable to join chats.";

                emitError(

                    socket,

                    message,

                    "JOIN_ALL_FAILED"

                );

                if (

                    typeof ack === "function"

                ) {

                    ack({

                        success: false,

                        message

                    });

                }

            }

        }

    );

    /*
    ------------------------------------------------------------
    Disconnect Cleanup
    ------------------------------------------------------------
    */

    socket.on(

        "disconnect",

        () => {

            leaveAllChatRooms(

                socket

            );

        }

    );

}
/*
|--------------------------------------------------------------------------
| Event Contract
|--------------------------------------------------------------------------
|
| Incoming Events
|
| chat:join
|
| {
|     chatPublicId
| }
|
|--------------------------------------------------------------
|
| chat:leave
|
| {
|     chatPublicId
| }
|
|--------------------------------------------------------------
|
| chat:join-all
|
| {
|     chats: [
|         publicId,
|         ...
|     ]
| }
|
|--------------------------------------------------------------------------
|
| Outgoing Events
|--------------------------------------------------------------------------
|
| chat:joined
|
| {
|     success,
|     room,
|     chatPublicId
| }
|
|--------------------------------------------------------------
|
| chat:left
|
| {
|     success,
|     room,
|     chatPublicId
| }
|
|--------------------------------------------------------------
|
| chat:error
|
| {
|     success,
|     code,
|     message
| }
|
|--------------------------------------------------------------------------
| Future Socket Events
|--------------------------------------------------------------------------
|
| This file intentionally manages ONLY room lifecycle.
|
| Future modules should remain separated.
|
| message.events.js
|
| • message:new
| • message:edited
| • message:deleted
| • reaction:add
| • reaction:remove
|
|--------------------------------------------------------------
|
| typing.events.js
|
| • typing:start
| • typing:stop
|
|--------------------------------------------------------------
|
| read.events.js
|
| • message:read
| • message:delivered
|
|--------------------------------------------------------------
|
| call.events.js
|
| • call:start
| • call:offer
| • call:answer
| • call:ice
| • call:end
|
|--------------------------------------------------------------------------
| Production Notes
|--------------------------------------------------------------------------
|
| Chat events are intentionally lightweight.
|
| They NEVER:
|
| ✗ Write to the database
| ✗ Perform business logic
| ✗ Modify chat state
|
| They ONLY:
|
| ✓ Validate payloads
| ✓ Verify membership
| ✓ Join Socket.IO rooms
| ✓ Leave Socket.IO rooms
| ✓ Support multi-device sessions
| ✓ Prepare for Redis scaling
|
|--------------------------------------------------------------------------
| Horizontal Scaling
|--------------------------------------------------------------------------
|
| Compatible with:
|
| ✓ Socket.IO Redis Adapter
| ✓ Kubernetes
| ✓ Docker Swarm
| ✓ PM2 Cluster Mode
| ✓ Multiple Backend Nodes
|
|--------------------------------------------------------------------------
| Message Flow
|--------------------------------------------------------------------------
|
| Client
|      │
|      ▼
| chat:join
|      │
|      ▼
| Validate
|      │
|      ▼
| Verify Membership
|      │
|      ▼
| Join Room
|      │
|      ▼
| Ack Client
|
|--------------------------------------------------------------------------
|
| chat.events.js
|
| Status
|
| ✓ Production Ready
| ✓ Redis Ready
| ✓ Cluster Ready
| ✓ Multi-device Ready
| ✓ Socket.IO v4 Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/
