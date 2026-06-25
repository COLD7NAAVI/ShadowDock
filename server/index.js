import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import pool from "./config/db.js"

const app = express()

/* ---------------- CORS ---------------- */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST"],
  })
)

app.use(express.json())

/* ---------------- HTTP SERVER ---------------- */

const server = http.createServer(app)

/* ---------------- SOCKET SERVER ---------------- */

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST"],
  },
})

/* ---------------- SOCKET CONNECTION ---------------- */

io.on("connection", (socket) => {

  console.log("User connected:", socket.id)

  socket.on("send_message", async (messageData) => {

    try {

      const { chat_id, sender, text } = messageData

      const result = await pool.query(
        `
        INSERT INTO messages (chat_id, sender, text)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [chat_id, sender, text]
      )

      const savedMessage = result.rows[0]

      io.emit("receive_message", savedMessage)

    } catch (err) {

      console.log("Message save error:", err)

    }

  })
  /* ---------------- TYPING ---------------- */

  socket.on("typing", ({ chat_id, user }) => {

  socket.broadcast.emit(
    "user_typing",
    {
      chat_id,
      user,
    }
  )

  })

  socket.on("stop_typing", ({ chat_id }) => {

  socket.broadcast.emit(
    "user_stop_typing",
    {
      chat_id,
    }
  )

})
  socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id)

  })

})

/* ---------------- ROUTES ---------------- */

app.get("/", (req, res) => {

  res.send("ShadowDock Backend Online ⚡")

})

app.get("/messages/:chatId", async (req, res) => {

  try {

    const { chatId } = req.params

    const result = await pool.query(
      `
      SELECT * FROM messages
      WHERE chat_id = $1
      ORDER BY created_at ASC
      `,
      [chatId]
    )

    res.json(result.rows)

  } catch (err) {

    console.log(err)

    res.status(500).json({
      error: "Failed to fetch messages",
    })

  }

})

/* ---------------- START SERVER ---------------- */

server.listen(5000, () => {

  console.log("Server running on port 5000")

})

/* ---------------- DATABASE ---------------- */

pool.connect()
  .then(() => {

    console.log("PostgreSQL connected")

  })
  .catch((err) => {

    console.log(err)

  })