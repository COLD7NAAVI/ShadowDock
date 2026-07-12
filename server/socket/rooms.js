/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Socket Room Manager
|
| Centralized Socket.IO room management.
|
| All room operations MUST go through this module.
|
| Responsibilities
|
| ✓ Room naming
| ✓ Join rooms
| ✓ Leave rooms
| ✓ Broadcast
| ✓ Room inspection
|
| Future:
|
| • Groups
| • Channels
| • Voice Calls
| • Video Calls
| • Livestreams
| • Redis Adapter
|
|--------------------------------------------------------------------------
*/

const ROOM_PREFIX = Object.freeze({

    CHAT: "chat",

    USER: "user",

    CALL: "call",

    GROUP: "group",

    CHANNEL: "channel"

});

/*
|--------------------------------------------------------------------------
| Room Name Helpers
|--------------------------------------------------------------------------
*/

export function getChatRoom(chatPublicId) {

    return `${ROOM_PREFIX.CHAT}:${chatPublicId}`;

}

export function getUserRoom(userPublicId) {

    return `${ROOM_PREFIX.USER}:${userPublicId}`;

}

export function getCallRoom(callId) {

    return `${ROOM_PREFIX.CALL}:${callId}`;

}

export function getGroupRoom(groupPublicId) {

    return `${ROOM_PREFIX.GROUP}:${groupPublicId}`;

}

export function getChannelRoom(channelPublicId) {

    return `${ROOM_PREFIX.CHANNEL}:${channelPublicId}`;

}

/*
|--------------------------------------------------------------------------
| Generic Room Helpers
|--------------------------------------------------------------------------
*/

export async function joinRoom(

    socket,

    room

) {

    if (!socket || !room) {

        return;

    }

    await socket.join(room);

}

export async function leaveRoom(

    socket,

    room

) {

    if (!socket || !room) {

        return;

    }

    await socket.leave(room);

}

export function emitToRoom(

    io,

    room,

    event,

    payload

) {

    io.to(room).emit(

        event,

        payload

    );

}

/*
|--------------------------------------------------------------------------
| Chat Rooms
|--------------------------------------------------------------------------
*/

export async function joinChatRoom(

    socket,

    chatPublicId

) {

    if (!chatPublicId) {

        return;

    }

    await joinRoom(

        socket,

        getChatRoom(chatPublicId)

    );

}

export async function leaveChatRoom(

    socket,

    chatPublicId

) {

    if (!chatPublicId) {

        return;

    }

    await leaveRoom(

        socket,

        getChatRoom(chatPublicId)

    );

}

/*
|--------------------------------------------------------------------------
| User Rooms
|--------------------------------------------------------------------------
*/

export async function joinUserRoom(

    socket,

    userPublicId

) {

    if (!userPublicId) {

        return;

    }

    await joinRoom(

        socket,

        getUserRoom(userPublicId)

    );

}

export async function leaveUserRoom(

    socket,

    userPublicId

) {

    if (!userPublicId) {

        return;

    }

    await leaveRoom(

        socket,

        getUserRoom(userPublicId)

    );

}

/*
|--------------------------------------------------------------------------
| Broadcast Helpers
|--------------------------------------------------------------------------
*/

export function emitToChat(

    io,

    chatPublicId,

    event,

    payload

) {

    emitToRoom(

        io,

        getChatRoom(chatPublicId),

        event,

        payload

    );

}

export function emitToUser(

    io,

    userPublicId,

    event,

    payload

) {

    emitToRoom(

        io,

        getUserRoom(userPublicId),

        event,

        payload

    );

}

export function emitToCall(

    io,

    callId,

    event,

    payload

) {

    emitToRoom(

        io,

        getCallRoom(callId),

        event,

        payload

    );

}

/*
|--------------------------------------------------------------------------
| Room Inspection
|--------------------------------------------------------------------------
*/

export async function getRoomMembers(

    io,

    room

) {

    return await io

        .in(room)

        .fetchSockets();

}

export async function getRoomSize(

    io,

    room

) {

    return (

        await getRoomMembers(

            io,

            room

        )

    ).length;

}

export function isInRoom(

    socket,

    room

) {

    return socket.rooms.has(room);

}

/*
|--------------------------------------------------------------------------
| rooms.js
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ Centralized Room Manager
| ✓ Stateless
| ✓ Socket.IO v4 Ready
| ✓ Redis Adapter Ready
| ✓ Cluster Ready
| ✓ Multi-device Ready
| ✓ Future Group Ready
| ✓ Future Channel Ready
| ✓ Future Call Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/