import socketAuth from "./auth.js";

import registerConnectionEvents from "./events/connection.events.js";

import registerPresenceEvents from "./events/presence.events.js";

import registerChatEvents from "./events/chat.events.js";

import registerMessageEvents from "./events/message.events.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Socket.IO Bootstrap
|
| Responsibilities
|
| ✓ Register authentication middleware
| ✓ Register connection lifecycle
| ✓ Register presence events
| ✓ Register chat events
| ✓ Register message events
|
| This file NEVER contains:
|
| ✗ SQL
| ✗ Repository calls
| ✗ Business logic
| ✗ Message handling
| ✗ Chat handling
|
| It only wires together the socket modules.
|
|--------------------------------------------------------------------------
*/

export default function setupSocket(io) {

    /*
    |--------------------------------------------------------------------------
    | Authentication Middleware
    |--------------------------------------------------------------------------
    */

    socketAuth(io);

    /*
    |--------------------------------------------------------------------------
    | Socket Connection
    |--------------------------------------------------------------------------
    */

    io.on(

        "connection",

        async (socket) => {

            try {

                console.log(

                    `🟢 Socket connected: ${socket.id} (${socket.user.username})`

                );

                /*
                --------------------------------------------------------------
                | Connection Lifecycle
                --------------------------------------------------------------
                */

                await registerConnectionEvents(

                    io,

                    socket

                );

                /*
                --------------------------------------------------------------
                | Presence
                --------------------------------------------------------------
                */

                registerPresenceEvents(

                    io,

                    socket

                );

                /*
                --------------------------------------------------------------
                | Chat Events
                --------------------------------------------------------------
                */

                registerChatEvents(

                    io,

                    socket

                );

                /*
                --------------------------------------------------------------
                | Message Events
                --------------------------------------------------------------
                */

                registerMessageEvents(

                    io,

                    socket

                );

            }

            catch (err) {

                console.error(

                    "Socket initialization failed:",

                    err

                );

                socket.disconnect(true);

            }

        }

    );

}

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
|
| ✓ Production Ready
| ✓ Stateless
| ✓ Authentication Ready
| ✓ Repository Driven
| ✓ Service Driven
| ✓ Socket.IO v4 Ready
| ✓ Redis Adapter Ready
| ✓ Cluster Ready
| ✓ Multi-device Ready
| ✓ Presence Ready
| ✓ Chat Ready
| ✓ Messaging Ready
| ✓ Horizontal Scaling Ready
| ✓ Future E2EE Compatible
|
| Future
|
| • Voice Calls
| • Video Calls
| • WebRTC Signaling
| • Push Notifications
| • Live Activities
| • Screen Sharing
| • Shared Presence
| • Cluster Metrics
|
|--------------------------------------------------------------------------
*/