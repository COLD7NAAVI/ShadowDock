import pg from "pg";
import env from "./env.js";

const { Pool } = pg;

const pool = new Pool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,

  min: env.database.pool.min,
  max: env.database.pool.max,
  idleTimeoutMillis:
    env.database.pool.idleTimeout,
  connectionTimeoutMillis:
    env.database.pool.connectionTimeout,

  ssl: env.database.ssl
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

pool.on("connect", () => {
  console.log("🟢 PostgreSQL connected.");
});

pool.on("error", (err) => {
  console.error(
    "🔴 PostgreSQL pool error:",
    err
  );
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function getClient() {
  return pool.connect();
}

export async function testConnection() {
  const client = await pool.connect();

  try {
    const result = await client.query(
      "SELECT NOW() AS server_time"
    );

    return result.rows[0];
  } finally {
    client.release();
  }
}

export default pool;