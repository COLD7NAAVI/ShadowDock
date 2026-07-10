import {
    addUserSocket,
    removeUserSocket,
    getUserSockets
} from "../socketStore.js";

import {
    joinUserRoom
} from "../rooms.js";

/*
|--------------------------------------------------------------------------
| Register Connection Events
|--------------------------------------------------------------------------
|
| Called once for every authenticated socket.
|
| Responsibilities:
|
| • Register socket
| • Join personal room
| • Notify user's other devices
| • Log connection
|
| Future:
|
| • Presence
| • Last Seen
| • Device Sync
| • Push Notifications
|
*/

export default async function registerConnectionEvents(

    io,

    socket

) {

    const user = socket.user;

    if (!user) {

        socket.disconnect(true);

        return;

    }

    /*
    |--------------------------------------------------------------------------
    | Register Socket
    |--------------------------------------------------------------------------
    */

    addUserSocket(

        user.id,

        socket.id

    );

    /*
    |--------------------------------------------------------------------------
    | Join Personal User Room
    |--------------------------------------------------------------------------
    */

    await joinUserRoom(

        socket,

        user.public_id

    );

    /*
    |--------------------------------------------------------------------------
    | Notify Other Devices
    |--------------------------------------------------------------------------
    |
    | If the user opens ShadowDock on multiple devices,
    | every device knows another session connected.
    |
    */

    const sockets = getUserSockets(

        user.id

    );

    io.to(

        `user:${user.public_id}`

    ).emit(

        "session:connected",

        {

            socketId: socket.id,

            totalConnections: sockets.length

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Logging
    |--------------------------------------------------------------------------
    */

    console.log(

        `🟢 ${user.username} connected (${socket.id})`

    );

    /*
    |--------------------------------------------------------------------------
    | Disconnect
    |--------------------------------------------------------------------------
    */

    socket.on(

        "disconnect",

        (reason) => {

            removeUserSocket(

                user.id,

                socket.id

            );

            const remainingSockets =

                getUserSockets(

                    user.id

                );

            io.to(

                `user:${user.public_id}`

            ).emit(

                "session:disconnected",

                {

                    socketId: socket.id,

                    totalConnections:

                        remainingSockets.length,

                    reason

                }

            );

            console.log(

                `🔴 ${user.username} disconnected (${socket.id})`

            );

        }

    );

}