import process from "process";
import dotenv from "dotenv";

dotenv.config();

const required = [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "COOKIE_SECRET",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `Missing environment variable: ${key}`
    );
  }
}

const env = Object.freeze({
  nodeEnv:
    process.env.NODE_ENV ||
    "development",

  isDevelopment:
    process.env.NODE_ENV !==
    "production",

  isProduction:
    process.env.NODE_ENV ===
    "production",

  server: {
    host:
      process.env.SERVER_HOST ||
      "localhost",

    port:
      Number(process.env.PORT) ||
      5000,
     
    trustProxy:
      process.env.TRUST_PROXY ===
      "true", 
  },

  client: {
    url:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  },

  database: {
    host: process.env.DB_HOST,

    port:
      Number(process.env.DB_PORT),

    name: process.env.DB_NAME,

    user: process.env.DB_USER,

    password:
      process.env.DB_PASSWORD,

    ssl:
      process.env.DB_SSL ===
      "true",

    pool: {
      min:
        Number(
          process.env.DB_POOL_MIN
        ) || 2,

      max:
        Number(
          process.env.DB_POOL_MAX
        ) || 20,

      idleTimeout:
        Number(
          process.env.DB_IDLE_TIMEOUT
        ) || 30000,

      connectionTimeout:
        Number(
          process.env
            .DB_CONNECTION_TIMEOUT
        ) || 5000,
    },
  },

  jwt: {
    accessSecret:
      process.env
        .JWT_ACCESS_SECRET,

    refreshSecret:
      process.env
        .JWT_REFRESH_SECRET,

    accessExpires:
      process.env
        .JWT_ACCESS_EXPIRES ||
      "15m",

    refreshExpires:
      process.env
        .JWT_REFRESH_EXPIRES ||
      "30d",

    issuer:
      process.env.JWT_ISSUER ||
      "ShadowDock",

    audience:
      process.env.JWT_AUDIENCE ||
      "ShadowDockUsers",
  },

  cookie: {
    secret:
      process.env.COOKIE_SECRET,

    accessCookieName:
      process.env
        .ACCESS_COOKIE_NAME ||
      "shadowdock_access",

    refreshCookieName:
      process.env
        .REFRESH_COOKIE_NAME ||
      "shadowdock_refresh",

    refreshMaxAge:
      Number(
        process.env
          .REFRESH_COOKIE_MAX_AGE
      ) ||
      30 *
        24 *
        60 *
        60 *
        1000,

    options: {
      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",

      httpOnly: true,
    },  
  },

  security: {
    bcryptRounds:
      Number(
        process.env
          .BCRYPT_SALT_ROUNDS
      ) || 12,
  },

  logger: {
    level:
      process.env.LOG_LEVEL ||
      "info",
  },
});

export default env;