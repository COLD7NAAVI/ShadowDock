import {

    useState,

} from "react";

export default function Sidebar({

    user,

    chats,

    selectedChatId,

    onSelectChat,

    onCreateChat,

    creatingChat,

    onLogout,

    connected,

}) {

    const [

        search,

        setSearch

    ] = useState("");

    const [

        targetPublicId,

        setTargetPublicId

    ] = useState("");

    console.log("SIDEBAR CHATS:", chats);

    const filteredChats =
        chats.filter(

            (chat) => {

                const query =
                    search
                        .trim()
                        .toLowerCase();

                if (!query) {

                    return true;

                }

                return (

                    chat.name
                        .toLowerCase()
                        .includes(query) ||

                    chat.otherUsername
                        ?.toLowerCase()
                        .includes(query)

                );

            }

        );

    function handleCreate(

        event

    ) {

        event.preventDefault();
        console.log("FORM SUBMITTED");
        console.log(targetPublicId);

        if (!targetPublicId.trim()) {

            return;

        }

        onCreateChat(

            targetPublicId

        );

        setTargetPublicId("");

    }

    return (

        <aside className="sidebar">

            <div className="sidebar-header">

                <div>

                    <div className="sidebar-brand">

                        ◈ ShadowDock

                    </div>

                    <div className="sidebar-user">

                        {user?.displayName ||
                         user?.username ||
                         "User"}

                    </div>

                </div>

                <div

                    className={
                        connected
                            ? "connection-dot online"
                            : "connection-dot"
                    }

                    title={
                        connected
                            ? "Connected"
                            : "Disconnected"
                    }

                />

            </div>

            <div className="sidebar-search">

                <input

                    value={search}

                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }

                    placeholder="Search conversations..."

                />

            </div>

            <form

                className="new-chat-form"

                onSubmit={handleCreate}

            >

                <input

                    value={targetPublicId}

                    onChange={(event) =>
                        setTargetPublicId(
                            event.target.value
                        )
                    }

                    placeholder="User public ID..."

                    disabled={creatingChat}

                />

                <button

                    type="submit"

                    disabled={
                        creatingChat ||
                        !targetPublicId.trim()
                    }

                >

                    {creatingChat
                        ? "..."
                        : "+"}

                </button>

            </form>

            <div className="chat-list">

                {filteredChats.length === 0 ? (

                    <div className="empty-sidebar">

                        <div>

                            No conversations yet.

                        </div>

                        <small>

                            Enter a user's public ID above.

                        </small>

                    </div>

                ) : (

                    filteredChats.map(

                        (chat) => (

                            <button

                                key={chat.id}

                                className={

                                    selectedChatId ===
                                    chat.id

                                        ? "chat-list-item active"

                                        : "chat-list-item"

                                }

                                onClick={() =>
                                    onSelectChat(
                                        chat.id
                                    )
                                }

                            >

                                <div className="avatar">

                                    {chat.name
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "?"}

                                </div>

                                <div className="chat-list-info">

                                    <div className="chat-list-name">

                                        {chat.name}

                                    </div>

                                    <div className="chat-list-preview">

                                        {chat.messages?.length

                                            ? chat.messages[
                                                chat.messages.length - 1
                                              ]?.text ||
                                              "No messages"

                                            : "Start a conversation"}

                                    </div>

                                </div>

                                {chat.unreadCount > 0 && (

                                    <span className="unread-badge">

                                        {chat.unreadCount}

                                    </span>

                                )}

                            </button>

                        )

                    )

                )}

            </div>

            <div className="sidebar-footer">

                <button

                    className="logout-button"

                    onClick={onLogout}

                >

                    Logout

                </button>

            </div>

        </aside>

    );

}