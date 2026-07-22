function ChatItem({ name, onClick }) {
  return (
    <div style={styles.chatItem} onClick={onClick}>
      {name}
    </div>
  );
}

const styles = {
  chatItem: {
    padding: "20px",
    borderBottom: "1px solid #1e293b",
    cursor: "pointer",
  },
};

export default ChatItem;