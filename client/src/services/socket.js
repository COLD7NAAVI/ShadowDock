import { io } from "socket.io-client";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Central Socket.IO Service
|
| Responsibilities
|
| ✓ Singleton socket instance
| ✓ Manual connect
| ✓ Manual disconnect
| ✓ JWT authentication
| ✓ Reconnection support
|
|--------------------------------------------------------------------------
*/

let socket = null;

/*
|--------------------------------------------------------------------------
| Connect
|--------------------------------------------------------------------------
*/

export function connectSocket(accessToken = null) {

    if (socket?.connected) {

        return socket;

    }

    socket = io(

        import.meta.env.VITE_API_URL ?? "http://localhost:5000",

        {

            autoConnect: true,

            withCredentials: true,

            transports: ["websocket"],

            auth: accessToken

                ? {

                    token: accessToken

                }

                : {}

        }

    );

    return socket;

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

/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default socket;
