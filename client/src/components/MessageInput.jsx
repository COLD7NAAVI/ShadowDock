import { useState } from "react"

function MessageInput({ onSend }) {

  const [text, setText] = useState("")

  const handleSend = () => {

    if (!text.trim()) return

    onSend(text)

    setText("")
  }

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {
      handleSend()
    }
  }

  return (

    <div className="message-input-container">

      <input
        type="text"
        placeholder="Type a message..."
        className="message-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        className="send-button"
        onClick={handleSend}
      >
        Send
      </button>

    </div>
  )
}

export default MessageInput