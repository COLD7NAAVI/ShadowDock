/*
|--------------------------------------------------------------------------
| Socket Room Manager
|--------------------------------------------------------------------------
|
| Centralized room management.
|
| Every socket event should use these helpers instead of directly calling:
|
| socket.join(...)
| socket.leave(...)
| io.to(...)
|
| This keeps room naming consistent across the application.
|
| Future Ready:
|
| • Private Chats
| • Groups
| • Channels
| • Voice Calls
| • Video Calls
| • Live Activities
|
*/

/*
|--------------------------------------------------------------------------
| Room Name Helpers
|--------------------------------------------------------------------------
*/

export function getChatRoom(

    chatPublicId

) {

    return `chat:${chatPublicId}`;

}

export function getUserRoom(

    userPublicId

) {

    return `user:${userPublicId}`;

}

export function getCallRoom(

    callId

) {

    return `call:${callId}`;

}

/*
|--------------------------------------------------------------------------
| Join Chat Room
|--------------------------------------------------------------------------
*/

export async function joinChatRoom(

    socket,

    chatPublicId

) {

    await socket.join(

        getChatRoom(chatPublicId)

    );

}

/*
|--------------------------------------------------------------------------
| Leave Chat Room
|--------------------------------------------------------------------------
*/

export async function leaveChatRoom(

    socket,

    chatPublicId

) {

    await socket.leave(

        getChatRoom(chatPublicId)

    );

}

/*
|--------------------------------------------------------------------------
| Join Personal Room
|--------------------------------------------------------------------------
*/

export async function joinUserRoom(

    socket,

    userPublicId

) {

    await socket.join(

        getUserRoom(userPublicId)

    );

}

/*
|--------------------------------------------------------------------------
| Leave Personal Room
|--------------------------------------------------------------------------
*/

export async function leaveUserRoom(

    socket,

    userPublicId

) {

    await socket.leave(

        getUserRoom(userPublicId)

    );

}

/*
|--------------------------------------------------------------------------
| Broadcast To Chat
|--------------------------------------------------------------------------
*/

export function emitToChat(

    io,

    chatPublicId,

    event,

    payload

) {

    io.to(

        getChatRoom(chatPublicId)

    ).emit(

        event,

        payload

    );

}

/*
|--------------------------------------------------------------------------
| Broadcast To User
|--------------------------------------------------------------------------
*/

export function emitToUser(

    io,

    userPublicId,

    event,

    payload

) {

    io.to(

        getUserRoom(userPublicId)

    ).emit(

        event,

        payload

    );

}

/*
|--------------------------------------------------------------------------
| Broadcast To Call
|--------------------------------------------------------------------------
*/

export function emitToCall(

    io,

    callId,

    event,

    payload

) {

    io.to(

        getCallRoom(callId)

    ).emit(

        event,

        payload

    );

}

/*
|--------------------------------------------------------------------------
| Room Utilities
|--------------------------------------------------------------------------
*/

export async function getRoomMembers(

    io,

    room

) {

    return Array.from(

        await io.in(room).fetchSockets()

    );

}

export async function getRoomSize(

    io,

    room

) {

    const sockets = await getRoomMembers(

        io,

        room

    );

    return sockets.length;

}