import {

    useEffect,
    useRef,
    useState,

} from "react";

import MessageBubble from "./MessageBubble.jsx";
import {
    Link
} from "react-router-dom";


export default function ChatArea({

    chat,

    currentUser,

    loading,

    onSendMessage,

    onDeleteMessage,

    connected,

}) {
    console.log("CHAT AREA:", chat);

    const [

        message,

        setMessage

    ] = useState("");

    const [

        sending,

        setSending

    ] = useState(false);

    const messagesEndRef =
        useRef(null);

    /*
    |--------------------------------------------------------------------------
    | Scroll
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({

            behavior: "smooth",

        });

    }, [

        chat?.messages?.length,

    ]);

    /*
    |--------------------------------------------------------------------------
    | Send
    |--------------------------------------------------------------------------
    */

    async function handleSend() {

        const text =
            message.trim();

        if (

            !text ||

            sending ||

            !connected ||

            !chat

        ) {

            return;

        }

        setSending(true);

        try {

            const success =
                await onSendMessage(
                    text
                );

            if (success) {

                setMessage("");

            }

        }

        finally {

            setSending(false);

        }

    }

    function handleKeyDown(

        event

    ) {

        if (

            event.key === "Enter" &&

            !event.shiftKey

        ) {

            event.preventDefault();

            handleSend();

        }

    }

    if (!chat) {

        return (

            <main className="chat-area empty-chat">

                <div className="empty-chat-content">

                    <div className="empty-logo">

                        ◈

                    </div>

                    <h1>

                        ShadowDock Chat

                    </h1>

                    <p>

                        Select a conversation to begin.

                    </p>

                </div>

            </main>

        );

    }

    return (

        <main className="chat-area">

            <header className="chat-header">

                {chat.otherPublicId ? (

                    <Link
                        to={`/profile/${chat.otherPublicId}`}
                        className="chat-profile-link"
                    >

                        <div className="avatar large">

                            {chat.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "?"}

                        </div>

                        <div className="chat-header-info">

                            <h2>
                                {chat.name}
                            </h2>

                            <span>
                                {connected
                                    ? "Connected"
                                    : "Reconnecting..."}

                            </span>

                        </div>

                    </Link>

                ) : (

                    <>
                        <div className="avatar large">

                            {chat.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "?"}

                        </div>

                        <div className="chat-header-info">

                            <h2>
                                {chat.name}
                            </h2>

                            <span>
                                {connected
                                    ? "Connected"
                                    : "Reconnecting..."}

                            </span>

                        </div>
                    </>

                )}

            </header>

            <section className="messages-container">

                {loading ? (

                    <div className="messages-loading">

                        Loading messages...

                    </div>

                ) : chat.messages?.length === 0 ? (

                    <div className="no-messages">

                        <div>

                            No messages yet.

                        </div>

                        <small>

                            Send the first message.

                        </small>

                    </div>

                ) : (

                    chat.messages.map(

                        (item) => {
                            console.log(item);
                            const own =

                                item.senderPublicId ===
                                currentUser?.publicId ||

                                item.senderUsername ===
                                currentUser?.username;

                            return (

                                <MessageBubble

                                    key={item.id}

                                    message={item}

                                    own={own}

                                    onDeleteMessage={
                                        onDeleteMessage
                                    }

                                />

                            );

                        }

                    )

                )}

                <div ref={messagesEndRef} />

            </section>

            <footer className="composer">

                <textarea

                    value={message}

                    onChange={(event) =>
                        setMessage(
                            event.target.value
                        )
                    }

                    onKeyDown={handleKeyDown}

                    placeholder={
                        connected
                            ? "Write a message..."
                            : "Waiting for connection..."
                    }

                    disabled={
                        !connected ||
                        sending
                    }

                    rows={1}

                />

                <button

                    onClick={handleSend}

                    disabled={

                        !connected ||

                        sending ||

                        !message.trim()

                    }

                >

                    {sending
                        ? "..."
                        : "Send"}

                </button>

            </footer>

        </main>

    );

}