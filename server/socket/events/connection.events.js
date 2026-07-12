import {
    getUserSockets
} from "../socketStore.js";

import {
    joinUserRoom
} from "../rooms.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Connection Events
|
| Responsibilities
|
| ✓ Validate authenticated socket
| ✓ Join personal user room
| ✓ Notify user's other devices
| ✓ Connection acknowledgement
|
| This module intentionally DOES NOT:
|
| ✗ Register socket
| ✗ Remove socket
| ✗ Update presence
| ✗ Touch PostgreSQL
|
| Those responsibilities belong to:
|
| • Presence Events
| • User Service
|
|--------------------------------------------------------------------------
*/

const EVENTS = Object.freeze({

    SESSION_CONNECTED: "session:connected",

    SESSION_READY: "session:ready"

});

/*
|--------------------------------------------------------------------------
| Register Connection Events
|--------------------------------------------------------------------------
*/

export default async function registerConnectionEvents(

    io,

    socket

) {

    const user = socket.user;

    /*
    |--------------------------------------------------------------------------
    | Authentication Check
    |--------------------------------------------------------------------------
    */

    if (!user) {

        socket.disconnect(true);

        return;

    }

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
    | Notify User Devices
    |--------------------------------------------------------------------------
    */

    const totalConnections =

        getUserSockets(

            user.id

        ).size;

    io.to(

        `user:${user.public_id}`

    ).emit(

        EVENTS.SESSION_CONNECTED,

        {

            userPublicId:

                user.public_id,

            socketId:

                socket.id,

            totalConnections

        }

    );

    /*
    |--------------------------------------------------------------------------
    | Acknowledge Current Socket
    |--------------------------------------------------------------------------
    */

    socket.emit(

        EVENTS.SESSION_READY,

        {

            socketId:

                socket.id,

            userPublicId:

                user.public_id,

            connectedAt:

                new Date().toISOString()

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

}

/*
|--------------------------------------------------------------------------
| connection.events.js
|--------------------------------------------------------------------------
|
| Status
|
| ✓ Production Ready
| ✓ Stateless
| ✓ Service Driven
| ✓ Presence Compatible
| ✓ Multi-device Ready
| ✓ Redis Ready
| ✓ Cluster Ready
| ✓ Socket.IO v4 Ready
| ✓ Future E2EE Compatible
|
|--------------------------------------------------------------------------
*/