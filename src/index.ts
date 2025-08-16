import express from "express";
import cors, { CorsOptions } from "cors";
import helmet from "helmet";

import * as dotenv from "dotenv";
if (process.env && process.env.NODE_ENV == "dev") {
  dotenv.config({ path: ".env.development" });
} else {
  dotenv.config({ path: ".env" });
}

import { userRouter } from "./user/user.router";
import { financeRouter } from "./finance/finance.router";
import { calendarRouter } from "./calendar/calendar.router";
import { projectsRouter } from "./projects/projects.router";
import { tasksRouter } from "./tasks/tasks.router";
import { AppDataSource } from "./typeorm/data-source";

const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    const allowedOrigins = process.env.ORIGIN?.split(",") ?? [];
    if (!origin || (origin && allowedOrigins?.includes(origin))) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  maxAge: ONE_DAY,
};

const startServer = async () => {
  const app = express();

  await AppDataSource.initialize()
    .then(() => {})
    .catch((err) => {
      console.error("Error during Data Source initialization", err);
    });

  app.set("trust proxy", 1);
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(express.json());

  // Routes
  app.use("/api/user", userRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/finance", financeRouter);
  app.use("/api/calendar", calendarRouter);

  const version = 0.1;
  app.get("/api/version", (req, res) => {
    res.json({ version: version });
  });

  app.listen(process.env.NODE_PORT, () => {
    console.log(`Listening on port ${process.env.NODE_PORT}`);
  });
};

startServer();
