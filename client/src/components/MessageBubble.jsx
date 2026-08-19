import { useState } from "react";

function formatTime(timestamp) {
    if (!timestamp) {
        return "";
    }

    return new Intl.DateTimeFormat(
        undefined,
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(
        new Date(timestamp)
    );
}

export default function MessageBubble({

    message,

    own,

    onDeleteMessage

}) {

    const [

        showMenu,

        setShowMenu

    ] = useState(false);

    function handleContextMenu(event) {

        if (!own || message.deleted) {

            return;
        }

        event.preventDefault();

        setShowMenu(true);
    }

    function handleDelete() {

        setShowMenu(false);

        if (window.confirm("Delete this message?")) {

            onDeleteMessage(message);
        }
    }

    function closeMenu() {

        if (showMenu) {

            setShowMenu(false);
        }
    }

    return (

        <div

            className={
                own
                    ? "message-row own"
                    : "message-row"
            }

            onClick={closeMenu}
        >

            <div

                className={
                    own
                        ? "message-bubble own"
                        : "message-bubble"
                }

                onContextMenu={handleContextMenu}
            >

                {

                    !own &&

                    message.senderDisplayName && (

                        <div className="message-sender">

                            {message.senderDisplayName}

                        </div>

                    )

                }

                <div className="message-text">

                    {

                        message.deleted

                            ? "Message deleted"

                            : message.text

                    }

                </div>

                <div className="message-meta">

                    <span>

                        {

                            formatTime(
                                message.createdAt
                            )

                        }

                    </span>

                    {

                        own && (

                            <span>

                                {

                                    message.deliveryStatus === "failed"

                                        ? "!"

                                        : message.deliveryStatus === "read"

                                            ? "✓✓"

                                            : "✓"

                                }

                            </span>

                        )

                    }

                </div>

                {

                    showMenu && (

                        <div className="message-menu">

                            <button

                                className="delete-message-button"

                                onClick={handleDelete}

                            >

                                Delete

                            </button>

                        </div>

                    )

                }

            </div>

        </div>

    );

}