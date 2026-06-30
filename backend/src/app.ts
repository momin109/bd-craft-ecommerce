import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

import { env } from "./config/env.js";
import { apiRoutes } from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
// import { notFound } from "./middlewares/notFound.js";
// import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

// app.use(
//   cors({
//     origin: env.clientUrl,
//     credentials: true,
//   }),
// );

const allowedOrigins = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request Origin:", origin);
      console.log("Allowed Origins:", allowedOrigins);

      // allow Postman / server-to-server
      if (!origin) return callback(null, true);

      // strict match
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "storage", "uploads")),
);

app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);
