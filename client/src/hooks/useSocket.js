import {

    useContext

} from "react";

import SocketContext from "../context/SocketContext.jsx";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Socket Hook
|
| Provides access to the application's
| shared Socket.IO context.
|
| Responsibilities
|
| ✓ Consume SocketContext
| ✓ Enforce Provider usage
|
| This hook NEVER:
|
| ✗ Creates sockets
| ✗ Connects sockets
| ✗ Disconnects sockets
|
| Those responsibilities belong to:
|
| • SocketContext
| • AuthContext
|
|--------------------------------------------------------------------------
*/

export default function useSocket() {

    const context =

        useContext(

            SocketContext

        );

    if (!context) {

        throw new Error(

            "useSocket must be used inside SocketProvider."

        );

    }

    return context;

}