import express from "express";
import cors from "cors";
import helmet from "helmet";
import {projectsRouter} from "./projects/projects.router";
import * as Process from "process";
import {tasksRouter} from "./tasks/tasks.router";

require('dotenv').config()
const app = express();
app.use(cors());
export const db = require('./database');

app.use(helmet());
app.use(express.json());
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);

app.listen(Process.env.NODE_PORT, () => {
    console.log(`Listening on port ${Process.env.NODE_PORT}`);
});