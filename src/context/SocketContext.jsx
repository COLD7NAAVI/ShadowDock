import {
    createContext,
    useEffect,
    useMemo
} from "react";

import socket, {
    connectSocket,
    disconnectSocket
} from "../services/socket.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Socket Context
|
| Current Responsibilities
|
| ✓ Own Socket lifecycle
| ✓ Automatically connect
| ✓ Automatically disconnect
| ✓ Provide shared socket instance
|
| Future
|
| ✓ Read JWT from AuthContext
| ✓ Connect after login
| ✓ Disconnect after logout
|
|--------------------------------------------------------------------------
*/

const SocketContext = createContext(null);

export function SocketProvider({

    children

}) {

    useEffect(() => {

        /*
        ---------------------------------------------------------------
        Temporary development connection.

        Authentication will replace this
        in a future milestone.
        ---------------------------------------------------------------
        */

        connectSocket();

        return () => {

            disconnectSocket();

        };

    }, []);

    const value = useMemo(

        () => ({

            socket

        }),

        []

    );

    return (

        <SocketContext.Provider value={value}>

            {children}

        </SocketContext.Provider>

    );

}

export default SocketContext;