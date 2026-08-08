function formatTime(

    timestamp

) {

    if (!timestamp) {

        return "";

    }

    return new Intl.DateTimeFormat(

        undefined,

        {

            hour: "2-digit",

            minute: "2-digit",

        }

    ).format(

        new Date(timestamp)

    );

}

export default function MessageBubble({

    message,

    own,

}) {

    return (

        <div

            className={

                own

                    ? "message-row own"

                    : "message-row"

            }

        >

            <div

                className={

                    own

                        ? "message-bubble own"

                        : "message-bubble"

                }

            >

                {!own &&
                    message.senderDisplayName && (

                    <div className="message-sender">

                        {message.senderDisplayName}

                    </div>

                )}

                <div className="message-text">

                    {message.deleted
                        ? "Message deleted"
                        : message.text}

                </div>

                <div className="message-meta">

                    <span>

                        {formatTime(
                            message.createdAt
                        )}

                    </span>

                    {own && (

                        <span>

                            {message.deliveryStatus ===
                            "failed"

                                ? "!"

                                : message.deliveryStatus ===
                                  "read"

                                    ? "✓✓"

                                    : "✓"}

                        </span>

                    )}

                </div>

            </div>

        </div>

    );

}