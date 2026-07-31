import { useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";

import chatsData from "../data/chats";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Home Page
|
| Responsibilities
|
| ✓ Display chat layout
| ✓ Manage selected conversation
| ✓ Provide data to child components
|
| This page NEVER:
|
| ✗ Makes API calls
| ✗ Connects sockets
| ✗ Handles authentication
|
| Those responsibilities belong elsewhere.
|
|--------------------------------------------------------------------------
*/

function HomePage() {

    /*
    |--------------------------------------------------------------------------
    | Chats
    |--------------------------------------------------------------------------
    */

    const chats = useMemo(

        () => chatsData,

        []

    );

    /*
    |--------------------------------------------------------------------------
    | Selected Chat
    |--------------------------------------------------------------------------
    */

    const [

        selectedChat,

        setSelectedChat

    ] = useState(

        chats[0] ?? null

    );

    /*
    |--------------------------------------------------------------------------
    | Layout
    |--------------------------------------------------------------------------
    */

    return (

        <div

            style={{

                display: "flex",

                width: "100vw",

                height: "100vh",

                overflow: "hidden",

                backgroundColor: "#020617",

                color: "#ffffff"

            }}

        >

            <Sidebar

                chats={chats}

                selectedChat={selectedChat}

                setSelectedChat={setSelectedChat}

            />

            <ChatArea

                chat={selectedChat}

            />

        </div>

    );

}

export default HomePage;