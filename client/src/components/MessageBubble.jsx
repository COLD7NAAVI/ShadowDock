function MessageBubble({ message }) {

  const isMe = message.sender === "me"

  return (

    <div
      className={`message-row ${
        isMe
          ? "message-row-right"
          : "message-row-left"
      }`}
    >

      <div
        className={`message-bubble ${
          isMe
            ? "sent"
            : "received"
        }`}
      >

        <div className="message-text">
          {message.text}
        </div>

        <div className="message-meta">

          <span className="message-time">
            {message.time || "12:00"}
          </span>

          {isMe && (

            <span className="message-status">

              {message.status === "seen"
                ? "✓✓"
                : "✓"}

            </span>

          )}

        </div>

      </div>

    </div>
  )
}

export default MessageBubble