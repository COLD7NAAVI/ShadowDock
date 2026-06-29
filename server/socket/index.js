export default function setupSocket(
  io,
  pool
) {
  io.on(
    "connection",
    (socket) => {
      console.log(
        `🟢 User connected: ${socket.id}`
      );

      /*
      ==========================
      JOIN CHAT ROOM
      ==========================
      */

      socket.on(
        "join_chat",
        (chatId) => {
          if (!chatId) return;

          const room =
            `chat_${chatId}`;

          socket.join(room);

          console.log(
            `📥 ${socket.id} joined ${room}`
          );
        }
      );

      /*
      ==========================
      LEAVE CHAT ROOM
      ==========================
      */

      socket.on(
        "leave_chat",
        (chatId) => {
          if (!chatId) return;

          const room =
            `chat_${chatId}`;

          socket.leave(room);

          console.log(
            `📤 ${socket.id} left ${room}`
          );
        }
      );

      /*
      ==========================
      SEND MESSAGE
      ==========================
      */

      socket.on(
        "send_message",
        async (messageData) => {
          try {
            const {
              chat_id,
              sender,
              text,
            } = messageData;

            if (
              !chat_id ||
              !sender ||
              !text?.trim()
            ) {
              return socket.emit(
                "message_error",
                {
                  message:
                    "Invalid message data",
                }
              );
            }

            const result =
              await pool.query(
                `
                INSERT INTO messages
                (chat_id, sender, text)
                VALUES ($1,$2,$3)
                RETURNING *
                `,
                [
                  chat_id,
                  sender,
                  text,
                ]
              );

            const savedMessage =
              result.rows[0];

            io.to(
              `chat_${chat_id}`
            ).emit(
              "receive_message",
              savedMessage
            );
          } catch (err) {
            console.error(
              "❌ Message save error:",
              err
            );

            socket.emit(
              "message_error",
              {
                message:
                  "Failed to send message",
              }
            );
          }
        }
      );

      /*
      ==========================
      USER TYPING
      ==========================
      */

      socket.on(
        "typing",
        ({
          chat_id,
          user,
        }) => {
          if (!chat_id) return;

          socket
            .to(`chat_${chat_id}`)
            .emit(
              "user_typing",
              {
                chat_id,
                user,
              }
            );
        }
      );

      /*
      ==========================
      USER STOPPED TYPING
      ==========================
      */

      socket.on(
        "stop_typing",
        ({ chat_id }) => {
          if (!chat_id) return;

          socket
            .to(`chat_${chat_id}`)
            .emit(
              "user_stop_typing",
              {
                chat_id,
              }
            );
        }
      );

      /*
      ==========================
      DISCONNECT
      ==========================
      */

      socket.on(
        "disconnect",
        (reason) => {
          console.log(
            `🔴 User disconnected: ${socket.id}`
          );

          console.log(
            `Reason: ${reason}`
          );
        }
      );
    }
  );
}