function Sidebar({ chats, selectedChat, setSelectedChat }) {
  return (
    <div
      style={{
        width: "320px",
        backgroundColor: "#020617",
        borderRight: "1px solid #1e293b",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          padding: "24px",
          margin: 0,
          fontSize: "28px",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        ShadowDock Chat
      </h1>

      <div style={{ padding: "16px" }}>
        <input
          type="text"
          placeholder="Search chats..."
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "none",
            outline: "none",
            backgroundColor: "#1e293b",
            color: "white",
          }}
        />
      </div>

      <div style={{ flex: 1 }}>
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            style={{
              padding: "24px",
              cursor: "pointer",
              textAlign: "center",
              borderTop: "1px solid #1e293b",
              backgroundColor:
                selectedChat?.id === chat.id
                  ? "#1e293b"
                  : "transparent",
            }}
          >
            {chat.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar