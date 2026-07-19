import {
    createContext,
    useEffect,
    useMemo
} from "react";

import socket, {
    connectSocket,
    disconnectSocket
} from "../socket/socket.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Socket Context
|
| Responsibilities
|
| ✓ Own Socket Lifecycle
| ✓ Connect after authentication
| ✓ Disconnect on logout
| ✓ Provide socket instance
|
|--------------------------------------------------------------------------
*/

const SocketContext = createContext(null);

export function SocketProvider({

    token,

    children

}) {

    useEffect(() => {

        if (!token) {

            disconnectSocket();

            return;

        }

        connectSocket(token);

        return () => {

            disconnectSocket();

        };

    }, [token]);

    const value = useMemo(() => ({

        socket

    }), []);

    return (

        <SocketContext.Provider value={value}>

            {children}

        </SocketContext.Provider>

    );

}

export default SocketContext;