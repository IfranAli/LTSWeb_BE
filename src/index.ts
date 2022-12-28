import express from "express";
import cors from "cors";
import helmet from "helmet";
import {projectsRouter} from "./projects/projects.router";
import * as Process from "process";
import {tasksRouter} from "./tasks/tasks.router";
import * as dotenv from 'dotenv'
import {passport, userRouter} from "./user/user.router";

if (process.env && (process.env.NODE_ENV == 'dev')) {
    dotenv.config({path: '.env.development'});
} else {
    dotenv.config({path: '.env'});
}

const sessionOptions = {
    secret: Process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
};

const app = express();
const session = require('express-session')
export const db = require('./database');

app.set('trust proxy', 1)
app.use(session(sessionOptions))
app.use(passport.initialize())
app.use(passport.session())
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/user', userRouter)

app.listen(Process.env.NODE_PORT, () => {
    console.log(`Listening on port ${Process.env.NODE_PORT}`);
});