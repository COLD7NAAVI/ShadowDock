import { useEffect, useRef, useState } from "react"
import MessageBubble from "./MessageBubble"

function ChatArea({ chat, onSendMessage, onTyping,
  typingUser, }) {

  const messagesEndRef = useRef(null)

  const [message, setMessage] = useState("")

  /* AUTO SCROLL */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    })

  }, [chat?.messages])

  /* SEND MESSAGE */

  const handleSendMessage = () => {

    if (!message.trim()) return

    onSendMessage(message)

    setMessage("")
  }

  /* EMPTY CHAT */

  if (!chat) {

    return (

      <div className="chat-area empty-chat-area">

        <div className="empty-chat-content">

          <h1>ShadowDock Chat</h1>

          <p>
            Select a conversation to start messaging
          </p>

        </div>

      </div>
    )
  }

  return (

    <div className="chat-area">

      {/* HEADER */}

      <div className="chat-header">

        <div className="chat-header-info">

          <div className="chat-avatar">
            {chat.name.charAt(0)}
          </div>

          <div className="chat-details">

            <h2>{chat.name}</h2>

            <span className="chat-status">
              {typingUser
                ? "typing..."
                : "online"}
               
            </span>

          </div>

        </div>

      </div>

      {/* MESSAGES */}

      <div className="messages">

        <div className="messages-inner">

          {chat.messages.map((message) => (

            <MessageBubble
              key={message.id}
              message={message}
            />

          ))}

          

          
            
          
          

          <div ref={messagesEndRef}></div>

        </div>

      </div>

      {/* INPUT AREA */}

      <div className="message-input-container">

        <textarea
          className="message-input"
          placeholder="Type a message..."
          value={message}
          rows={1}

          onChange={(e) =>{
            setMessage(e.target.value)
            if (onTyping) {
              onTyping(chat.id)
            }
          }}

          onInput={(e) => {

            e.target.style.height = "auto"

            e.target.style.height =
              e.target.scrollHeight + "px"
          }}

          onKeyDown={(e) => {

            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {

              e.preventDefault()

              handleSendMessage()
            }
          }}
        />

        <button
          className="send-button"
          onClick={handleSendMessage}
        >
          Send
        </button>

      </div>

    </div>
  )
}

export default ChatArea