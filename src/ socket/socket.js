import { io } from "socket.io-client";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Socket.IO Client
|
| Single socket instance for the entire application.
|
| Responsibilities
|
| ✓ Connect
| ✓ Disconnect
| ✓ Authentication
| ✓ Reconnection
| ✓ Transport selection
|
| This module NEVER:
|
| ✗ Stores JWT
| ✗ Reads localStorage directly
| ✗ Contains business logic
| ✗ Contains React code
|
|--------------------------------------------------------------------------
*/

const SOCKET_URL =
    import.meta.env.VITE_API_URL ??
    "http://localhost:5000";

export const socket = io(

    SOCKET_URL,

    {

        autoConnect: false,

        transports: [

            "websocket",

            "polling"

        ],

        withCredentials: true,

        reconnection: true,

        reconnectionAttempts: Infinity,

        reconnectionDelay: 1000,

        timeout: 10000

    }

);

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

export function connectSocket(token = null) {

    if (token) {

        socket.auth = {

            token

        };

    } else {

        socket.auth = {};

    }

    if (!socket.connected) {

        socket.connect();

    }

}

export function disconnectSocket() {

    if (socket.connected) {

        socket.disconnect();

    }

}

export default socket;