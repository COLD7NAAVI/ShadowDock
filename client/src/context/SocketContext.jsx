import {
    createContext,
    useEffect,
    useMemo,
    useState
} from "react";

import {

    getSocket

} from "../services/socket.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Socket Context
|
| Responsibilities
|
| ✓ Expose shared Socket.IO instance
| ✓ Track connection state
| ✓ Listen for socket lifecycle events
|
| This context NEVER:
|
| ✗ Creates sockets
| ✗ Connects sockets
| ✗ Disconnects sockets
| ✗ Handles authentication
|
| Those responsibilities belong to:
|
| • AuthContext
| • services/socket.js
|
|--------------------------------------------------------------------------
*/

const SocketContext = createContext(null);

export function SocketProvider({

    children

}) {

    /*
    |--------------------------------------------------------------------------
    | Shared Socket Instance
    |--------------------------------------------------------------------------
    */

    const socket = getSocket();

    /*
    |--------------------------------------------------------------------------
    | Connection State
    |--------------------------------------------------------------------------
    */

    const [

        connected,

        setConnected

    ] = useState(

        socket?.connected ?? false

    );

    /*
    |--------------------------------------------------------------------------
    | Listen For Socket Events
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!socket) {

            return;

        }

        const handleConnect = () => {

            setConnected(true);

        };

        const handleDisconnect = () => {

            setConnected(false);

        };

        socket.on(

            "connect",

            handleConnect

        );

        socket.on(

            "disconnect",

            handleDisconnect

        );

        return () => {

            socket.off(

                "connect",

                handleConnect

            );

            socket.off(

                "disconnect",

                handleDisconnect

            );

        };

    }, [

        socket

    ]);

    /*
    |--------------------------------------------------------------------------
    | Context Value
    |--------------------------------------------------------------------------
    */

    const value = useMemo(

        () => ({

            socket,

            connected,

            isConnected: connected

        }),

        [

            socket,

            connected

        ]

    );

    return (

        <SocketContext.Provider

            value={value}

        >

            {children}

        </SocketContext.Provider>

    );

}

export default SocketContext;