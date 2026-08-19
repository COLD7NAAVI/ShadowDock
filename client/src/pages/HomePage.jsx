import {
    useCallback,
    useEffect,
    useState
} from "react";

import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";

import useAuth from "../hooks/useAuth.js";
import useSocket from "../hooks/useSocket.js";

import {
    getChats,
    createPrivateChat
} from "../services/chat.js";

import {
    getChatMessages,
    
    normalizeMessage
} from "../services/message.js";

/*
|--------------------------------------------------------------------------
| ShadowDock Messenger
|--------------------------------------------------------------------------
|
| Home Page
|
| Responsibilities
|
| ✓ Load authenticated user's chats
| ✓ Manage selected conversation
| ✓ Load message history
| ✓ Join selected Socket.IO chat room
| ✓ Send messages
| ✓ Receive realtime messages
| ✓ Create private chats
| ✓ Provide data/actions to child components
|
| This page NEVER:
|
| ✗ Handles authentication directly
| ✗ Stores JWT
| ✗ Executes SQL
|
|--------------------------------------------------------------------------
*/

function normalizeChat(chat) {

    if (!chat) {

        return null;

    }

    return {

        ...chat,

        id:
            chat.public_id ??
            chat.publicId ??
            chat.id,

        publicId:
            chat.public_id ??
            chat.publicId ??
            chat.id,

        name:
            chat.name ??
            chat.display_name ??
            chat.username ??
            "Unknown",

        otherUsername:
            chat.other_username ??
            chat.otherUsername ??
            "",

        messages:
            Array.isArray(chat.messages)
                ? chat.messages
                : [],

        unreadCount:
            Number(
                chat.unread_count ??
                chat.unreadCount ??
                0
            )

    };

}

function HomePage() {

    const {

        user,

        logout

    } = useAuth();

    const {

        socket,

        connected

    } = useSocket();

    const [

        chats,

        setChats

    ] = useState([]);

    const [

        selectedChatId,

        setSelectedChatId

    ] = useState(null);

    const [

        loadingChats,

        setLoadingChats

    ] = useState(true);

    const [

        loadingMessages,

        setLoadingMessages

    ] = useState(false);

    const [

        creatingChat,

        setCreatingChat

    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Load Chats
    |--------------------------------------------------------------------------
    */

    const loadChats = useCallback(

        async () => {

            setLoadingChats(true);

            try {

                const result =
                    await getChats();

                const normalized =
                    result
                        .map(normalizeChat)
                        .filter(Boolean);
                console.log(
                    "NORMALIZED CHATS:",
                    normalized
                );
                setChats(normalized);

                setSelectedChatId(

                    (current) =>

                        current ??
                        normalized[0]?.id ??
                        null

                );

            }

            catch (error) {

                console.error(

                    "Failed to load chats:",

                    error

                );

            }

            finally {

                setLoadingChats(false);

            }

        },

        []

    );

    /*
    |--------------------------------------------------------------------------
    | Initial Chat Load
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        void loadChats();

    }, [

        loadChats

    ]);

    /*
    |--------------------------------------------------------------------------
    | Selected Chat
    |--------------------------------------------------------------------------
    */

    const selectedChat =
        chats.find(

            (chat) =>

                chat.id ===
                selectedChatId

        ) ?? null;

    /*
    |--------------------------------------------------------------------------
    | Load Message History
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!selectedChatId) {

            return;

        }

        let cancelled = false;

        async function loadMessages() {

            setLoadingMessages(true);

            try {

                const messages =
                    await getChatMessages(

                        selectedChatId

                    );

                if (cancelled) {

                    return;

                }

                setChats(

                    (currentChats) =>

                        currentChats.map(

                            (chat) =>

                                chat.id ===
                                selectedChatId

                                    ? {

                                        ...chat,

                                        messages

                                    }

                                    : chat

                        )

                );

            }

            catch (error) {

                if (!cancelled) {

                    console.error(

                        "Failed to load messages:",

                        error

                    );

                }

            }

            finally {

                if (!cancelled) {

                    setLoadingMessages(false);

                }

            }

        }

        void loadMessages();

        return () => {

            cancelled = true;

        };

    }, [

        selectedChatId

    ]);

    /*
    |--------------------------------------------------------------------------
    | Join Selected Chat Room
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (

            !socket ||

            !connected ||

            !selectedChatId

        ) {

            return;

        }

        socket.emit(

            "chat:join",

            {

                chatPublicId:
                    selectedChatId

            },

            (response) => {

                if (!response?.success) {

                    console.error(

                        "Failed to join chat:",

                        response?.message

                    );

                }

            }

        );

        return () => {

            if (socket.connected) {

                socket.emit(

                    "chat:leave",

                    {

                        chatPublicId:
                            selectedChatId

                    }

                );

            }

        };

    }, [

        socket,

        connected,

        selectedChatId

    ]);

    /*
    |--------------------------------------------------------------------------
    | Receive New Messages
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!socket) {

            return;

        }

        function handleNewMessage(

            message

        ) {

            const normalized =
                normalizeMessage(
                    message
                );

            if (!normalized) {

                return;

            }

            setChats(

                (currentChats) =>

                    currentChats.map(

                        (chat) => {

                            if (

                                chat.id !==
                                normalized.chatPublicId

                            ) {

                                return chat;

                            }

                            const exists =
                                chat.messages?.some(

                                    (item) =>

                                        item.id ===
                                        normalized.id

                                );

                            if (exists) {

                                return chat;

                            }

                            return {

                                ...chat,

                                messages: [

                                    ...(chat.messages ?? []),

                                    normalized

                                ]

                            };

                        }

                    )

            );

        }

        socket.on(

            "message:new",

            handleNewMessage

        );
        
        function handleDeletedMessage(

            message

        ) {

            setChats(

                (currentChats) =>

                    currentChats.map(

                        (chat) => {

                            if (

                                chat.id !==

                             message.chat_public_id

                            ) {

                                return chat;

                            }

                            return {

                                ...chat,

                                messages:

                                    chat.messages.filter(

                                        (item) =>

                                            item.publicId !==

                                            message.public_id

                                    )

                            };

                        }

                    )

            );

        }
        socket.on(

            "message:deleted",

            handleDeletedMessage

        );

        return () => {

            socket.off(

                "message:new",

                handleNewMessage

            );
             socket.off(

                "message:deleted",

                handleDeletedMessage

            );

        };

    }, [

        socket

    ]);

    /*
    |--------------------------------------------------------------------------
    | Select Chat
    |--------------------------------------------------------------------------
    */

    const handleSelectChat =
        useCallback(

            (chatId) => {

                setSelectedChatId(

                    chatId

                );

            },

            []

        );

    /*
    |--------------------------------------------------------------------------
    | Create Private Chat
    |--------------------------------------------------------------------------
    */

    const handleCreateChat =
        useCallback(

            async (targetPublicId) => {

                if (

                    !targetPublicId?.trim() ||

                    creatingChat

                ) {

                    return;

                }

                setCreatingChat(true);

                try {

                    const result =
                        await createPrivateChat(

                            targetPublicId.trim()

                        );

                    const newChat =
                        normalizeChat(
                            result
                        );

                    if (!newChat) {

                        return;

                    }

                    setChats(

                        (currentChats) => {

                            const exists =
                                currentChats.some(

                                    (chat) =>

                                        chat.id ===
                                        newChat.id

                                );

                            if (exists) {

                                return currentChats;

                            }

                            return [

                                newChat,

                                ...currentChats

                            ];

                        }

                    );

                    setSelectedChatId(

                        newChat.id

                    );

                }

                catch (error) {

                    console.error(

                        "Failed to create chat:",

                        error

                    );

                }

                finally {

                    setCreatingChat(false);

                }

            },

            [

                creatingChat

            ]

        );

    /*
    |--------------------------------------------------------------------------
    | Send Message
    |--------------------------------------------------------------------------
    */

    const handleSendMessage =
        useCallback(

            async (text) => {

                if (

                    !socket ||

                    !connected ||

                    !selectedChatId ||

                    !text?.trim()

                ) {

                    return false;

                }
                console.log(
                    "SELECTED CHAT ID:",
                    selectedChatId
                );

                return new Promise(

                    (resolve) => {

                        socket.emit(

                            "message:send",

                            {

                                chatPublicId:
                                    selectedChatId,

                                text:
                                    text.trim(),

                                messageType:
                                    "text",

                                metadata: {}

                            },

                            (response) => {

                                if (

                                    response?.success

                                ) {

                                    resolve(true);

                                    return;

                                }

                                console.error(

                                    "Message send failed:",

                                    response?.message

                                );

                                resolve(false);

                            }

                        );

                    }

                );

            },

            [

                socket,

                connected,

                selectedChatId

            ]

        );

    const handleDeleteMessage = useCallback(
        async (message) => {
            if (!socket || !connected || !message) {
                return;
            }

            socket.emit(
                "message:delete",
                {
                    messagePublicId:
                        message.publicId,
                },
                (response) => {
                    if (!response?.success) {
                        console.error(
                            "Delete failed:",
                            response?.message
                        );
                    }
                }
            );
        },
        [
            socket,
            connected,
        ]
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

                user={user}

                chats={chats}

                selectedChatId={
                    selectedChatId
                }

                onSelectChat={
                    handleSelectChat
                }

                onCreateChat={
                    handleCreateChat
                }

                creatingChat={
                    creatingChat
                }

                onLogout={
                    logout
                }

                connected={
                    connected
                }

            />

            <ChatArea

                chat={selectedChat}

                currentUser={user}

                loading={
                    loadingChats ||
                    loadingMessages
                }

                onSendMessage={
                    handleSendMessage
                }

                onDeleteMessage={
                    handleDeleteMessage
                }

                connected={
                    connected
                }

            />

        </div>

    );

}

export default HomePage;