import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { apiRoutes } from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
// import { notFound } from "./middlewares/notFound.js";
// import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(helmet());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);
