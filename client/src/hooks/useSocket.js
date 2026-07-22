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
| single Socket.IO instance.
|
|--------------------------------------------------------------------------
*/

export default function useSocket() {

    const context =

        useContext(SocketContext);

    if (!context) {

        throw new Error(

            "useSocket must be used inside SocketProvider."

        );

    }

    return context;

}