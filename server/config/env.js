import dotenv from "dotenv";

dotenv.config();

const required = [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  server: {
    host: process.env.SERVER_HOST || "localhost",
    port: Number(process.env.PORT) || 5000,
  },

  client: {
    url: process.env.CLIENT_URL || "http://localhost:5173",
  },

  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    ssl: process.env.DB_SSL === "true",

    pool: {
      min: Number(process.env.DB_POOL_MIN) || 2,
      max: Number(process.env.DB_POOL_MAX) || 20,
      idleTimeout:
        Number(process.env.DB_IDLE_TIMEOUT) || 30000,
      connectionTimeout:
        Number(process.env.DB_CONNECTION_TIMEOUT) || 5000,
    },
  },
};

export default env;