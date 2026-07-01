import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import env from "./config/env.js";
import routes from "./routes/index.js";

import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

if (env.server.trustProxy) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

/* ---------------- CORS ---------------- */

app.use(
  cors({
    origin: env.client.url,
    credentials: true,
  })
);

/* ---------------- SECURITY ---------------- */

app.use(helmet());

/* ---------------- COMPRESSION ---------------- */

app.use(compression());
app.use(cookieParser());

/* ---------------- LOGGER ---------------- */

app.use(morgan("dev"));

const apiLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 300,

    standardHeaders: true,
    legacyHeaders: false,
  });

const authLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 10,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many authentication attempts. Please try again later.",
    },
  });

app.use(
  "/api",
  apiLimiter
);

app.use(
  "/api/v1/auth",
  authLimiter
);
/* ---------------- BODY PARSER ---------------- */

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);

/* ---------------- ROOT ---------------- */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ShadowDock API",
    version: "v1",
  });
});

/* ---------------- API ROUTES ---------------- */

app.use("/api/v1", routes);

/* ---------------- ERROR HANDLING ---------------- */

app.use(notFound);

app.use(errorHandler);

export default app;