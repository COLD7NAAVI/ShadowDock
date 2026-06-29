import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import env from "./config/env.js";
import routes from "./routes/index.js";

import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

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

/* ---------------- LOGGER ---------------- */

app.use(morgan("dev"));

/* ---------------- BODY PARSER ---------------- */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
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