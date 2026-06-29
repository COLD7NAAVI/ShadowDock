import process from "process";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import env from "./config/env.js";

import pool, {
  testConnection,
} from "./config/db.js";

import setupSocket from "./socket/index.js";

const server =
  http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.client.url,
    credentials: true,
  },
});

setupSocket(io, pool);

async function startServer() {
  try {
    await testConnection();

    console.log(
      "🟢 PostgreSQL connected."
    );

    server.listen(
      env.server.port,
      () => {
        console.log(
          `🚀 Server running on port ${env.server.port}`
        );
      }
    );
  } catch (err) {
    console.error(
      "Failed to start server:",
      err
    );

    process.exit(1);
  }
}

startServer();

/* ---------------- SHUTDOWN ---------------- */

async function shutdown() {
  console.log(
    "🛑 Server shutting down..."
  );

  server.close(async () => {
    try {
      await pool.end();

      console.log(
        "🟢 PostgreSQL pool closed."
      );
    } catch (err) {
      console.error(err);
    }

    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);