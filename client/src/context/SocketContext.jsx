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
| Socket Context
|--------------------------------------------------------------------------
*/

const SocketContext =
    createContext(null);

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
*/

export function SocketProvider({

    children

}) {

    const [

        socket,

        setSocket

    ] = useState(

        () => getSocket()

    );

    const [

        connected,

        setConnected

    ] = useState(

        () =>
            Boolean(
                getSocket()?.connected
            )

    );

    /*
    |--------------------------------------------------------------------------
    | Detect socket creation
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const interval =
            setInterval(() => {

                const currentSocket =
                    getSocket();

                setSocket(
                    currentSocket
                );

                setConnected(

                    Boolean(
                        currentSocket?.connected
                    )

                );

            }, 250);

        return () => {

            clearInterval(
                interval
            );

        };

    }, []);

    /*
    |--------------------------------------------------------------------------
    | Socket lifecycle
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

        setConnected(
            socket.connected
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
    | Context
    |--------------------------------------------------------------------------
    */

    const value = useMemo(

        () => ({

            socket,

            connected,

            isConnected:
                connected

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