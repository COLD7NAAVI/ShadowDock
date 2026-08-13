import { io } from "socket.io-client";

/*
|--------------------------------------------------------------------------
| ShadowDock Socket.IO Service
|--------------------------------------------------------------------------
*/

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:5000";

let socket = null;

/*
|--------------------------------------------------------------------------
| Connect
|--------------------------------------------------------------------------
*/

export function connectSocket(

    accessToken = null

) {

    /*
    --------------------------------------------------------------
    Already connected
    --------------------------------------------------------------
    */

    if (socket?.connected) {

        /*
        Update credentials for future reconnects.
        */

        if (accessToken) {

            socket.auth = {

                token:
                    accessToken

            };

        }

        return socket;

    }

    /*
    --------------------------------------------------------------
    Existing but disconnected socket
    --------------------------------------------------------------
    */

    if (socket) {

        socket.auth = {

            token:
                accessToken

        };

        socket.connect();

        return socket;

    }

    /*
    --------------------------------------------------------------
    Create singleton socket
    --------------------------------------------------------------
    */

    socket = io(

        SOCKET_URL,

        {

            autoConnect: false,

            withCredentials: true,

            transports: [

                "websocket",

                "polling"

            ],

            auth: {

                token:
                    accessToken

            },

            reconnection: true,

            reconnectionAttempts: Infinity,

            reconnectionDelay: 1000,

            reconnectionDelayMax: 5000

        }

    );
    socket.on("connect", () => {
        console.log(
         "🟢 [ShadowDock Socket] connected:",
         socket.id
        );
    });

    socket.on("disconnect", (reason) => {
        console.log(
            "🔴 [ShadowDock Socket] disconnected:",
            reason
        );
    });

    socket.on("connect_error", (error) => {
        console.error(
         "❌ [ShadowDock Socket] connect_error:",
          error.message,
         error
        );
    });

    socket.io.on("reconnect_attempt", (attempt) => {
        console.log(
         "🟡 [ShadowDock Socket] reconnect attempt:",
         attempt
        );
    });

    socket.io.on("reconnect", (attempt) => {
        console.log(
          "🟢 [ShadowDock Socket] reconnected after:",
         attempt
        );
    });

    socket.io.on("reconnect_error", (error) => {
        console.error(
          "❌ [ShadowDock Socket] reconnect_error:",
         error.message
        );
    });

    socket.connect();

    return socket;

}

/*
|--------------------------------------------------------------------------
| Update authentication token
|--------------------------------------------------------------------------
*/

export function updateSocketToken(

    accessToken

) {

    if (!socket) {

        return;

    }

    socket.auth = {

        token:
            accessToken

    };

}

/*
|--------------------------------------------------------------------------
| Disconnect
|--------------------------------------------------------------------------
*/

export function disconnectSocket() {

    if (!socket) {

        return;

    }

    socket.removeAllListeners();

    socket.disconnect();

    socket = null;

}

/*
|--------------------------------------------------------------------------
| Getter
|--------------------------------------------------------------------------
*/

export function getSocket() {

    return socket;

}

export default getSocket;