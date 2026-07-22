import {
    createContext,
    useEffect,
    useMemo
} from "react";

import {

    connectSocket,
    disconnectSocket,
    getSocket

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

    
    const value = useMemo(

        () => ({

            socket: getSocket(),

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