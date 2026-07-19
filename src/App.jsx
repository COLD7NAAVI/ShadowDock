import { useState, useEffect } from "react"
import axios from "axios"

import Sidebar from "./components/Sidebar"
import ChatArea from "./components/ChatArea"

import chatsData from "./data/chats"
import useSocket from "./hooks/useSocket";

import "./App.css"

function App() {

  /* ---------------- STATES ---------------- */

  const [chats, setChats] = useState(chatsData)

  const [typingUsers, setTypingUsers] = useState({})

  const [selectedChatId, setSelectedChatId] = useState(
    chatsData[0].id
  )
  const { socket } = useSocket();
  /* ---------------- SELECTED CHAT ---------------- */

  const selectedChat = chats.find(
    (chat) => chat.id === selectedChatId
  )

  /* ---------------- LOAD MESSAGES ---------------- */

  useEffect(() => {

    const loadMessages = async () => {

      try {

        const response = await axios.get(
          `http://localhost:5000/messages/${selectedChatId}`
        )

        const dbMessages = response.data

        setChats((prevChats) =>

          prevChats.map((chat) =>

            chat.id === selectedChatId

              ? {
                  ...chat,

                  messages: dbMessages.map((msg) => ({

                    id: msg.id,

                    text: msg.text,

                    sender: msg.sender,

                    time:
                      msg.time ||

                      new Date().toLocaleTimeString([], {

                        hour: "2-digit",

                        minute: "2-digit",
                      }),

                    status:
                      msg.status || "seen",
                  })),
                }

              : chat
          )
        )

      } catch (err) {

        console.log(
          "Load message error:",
          err
        )
      }
    }

    loadMessages()

  }, [selectedChatId])

  /* ---------------- SOCKET EVENTS ---------------- */

  useEffect(() => {

    /* RECEIVE MESSAGE */

    const handleReceiveMessage = (message) => {

      /* IGNORE OWN SOCKET ECHO */

      if (message.sender === "me") {
        return
      }

      setChats((prevChats) =>

        prevChats.map((chat) =>

          chat.id === message.chat_id

            ? {

                ...chat,

                messages: [

                  ...chat.messages,

                  {

                    id: message.id,

                    text: message.text,

                    sender: message.sender,

                    time: message.time,

                    status: message.status,
                  },
                ],
              }

            : chat
        )
      )
    }

    /* USER TYPING */

    const handleUserTyping = ({
      chat_id,
      user,
    }) => {

      setTypingUsers((prev) => ({
        ...prev,
        [chat_id]: user,
      }))
    }

    /* USER STOP TYPING */

    const handleUserStopTyping = ({
      chat_id,
    }) => {

      setTypingUsers((prev) => ({
        ...prev,
        [chat_id]: null,
      }))
    }

    /* SOCKET LISTENERS */

    socket?.on(
      "receive_message",
      handleReceiveMessage
    )

    socket?.on(
      "user_typing",
      handleUserTyping
    )

    socket?.on(
      "user_stop_typing",
      handleUserStopTyping
    )

    /* CLEANUP */

    return () => {

      socket?.off(
        "receive_message",
        handleReceiveMessage
      )

      socket?.off(
        "user_typing",
        handleUserTyping
      )

      socket?.off(
        "user_stop_typing",
        handleUserStopTyping
      )
    }

  }, [socket])

  /* ---------------- SEND MESSAGE ---------------- */

  const sendMessage = (text) => {

    if (
      !text.trim() ||
      !selectedChat
    ) return

    const newMessage = {

      id: Date.now(),

      chat_id: selectedChat.id,

      sender: "me",

      text: text,

      time: new Date().toLocaleTimeString([], {

        hour: "2-digit",

        minute: "2-digit",
      }),

      status: "sent",
    }

    /* LOCAL INSTANT MESSAGE */

    setChats((prevChats) =>

      prevChats.map((chat) =>

        chat.id === selectedChat.id

          ? {

              ...chat,

              messages: [
                ...chat.messages,
                newMessage,
              ],
            }

          : chat
      )
    )

    /* SOCKET SEND */

    socket?.emit(
      "send_message",
      newMessage
    )
  }

  /* ---------------- UI ---------------- */

  return (

    <div className="app">

      <Sidebar
        chats={chats}
        selectedChat={selectedChat}
        setSelectedChat={(chat) =>
          setSelectedChatId(chat.id)
        }
      />

      <div className="chat-section">

        {selectedChat ? (

          <ChatArea
            chat={selectedChat}
            onSendMessage={sendMessage}
            typingUser={typingUsers[selectedChat.id]}
            onTyping={(chatId) => {
              socket?.emit("typing", {
                chat_id: chatId,
                user: "Ghost",
                })
                clearTimeout(window.typingTimeout)

                window.typingTimeout = setTimeout(() => {

                  socket?.emit("stop_typing", {
                    chat_id: chatId,
                  })

                }, 1000)

            }}
                      
          />


        ) : (

          <div className="no-chat">

            No Chat Selected

          </div>

        )}

      </div>

    </div>
  )
}

export default App