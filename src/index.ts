import express from "express";
import cors, {CorsOptions} from "cors";
import helmet from "helmet";
import {projectsRouter} from "./projects/projects.router";
import * as Process from "process";
import {tasksRouter} from "./tasks/tasks.router";
import * as dotenv from 'dotenv'
import {userRouter} from "./user/user.router";
import session, {SessionOptions} from 'express-session';
import {financeRouter} from "./finance/finance.router";
import {FinanceService} from "./finance/finance.service";
import {UserService} from "./user/user.service";
import {ProjectsService} from "./projects/project.service";
import {TasksService} from "./tasks/task.service";
import {passport} from "./passport-config";

if (process.env && (process.env.NODE_ENV == 'dev')) {
    dotenv.config({path: '.env.development'});
} else {
    dotenv.config({path: '.env'});
}

const ONE_DAY = 24 * 60 * 60 * 1000 // 24 hours

const sessionOptions: SessionOptions = {
    secret: Process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: ONE_DAY,
    }
};

const corsOptions: CorsOptions = {
    origin: Process.env.ORIGIN,
    credentials: true,
    maxAge: ONE_DAY,
}

const app = express();

// todo: convert to import
export const db = require('./database');

export const services = async (req: any, res: any, next: any) => {
    req.services = Object.freeze({
        financeService: new FinanceService(db.pool),
        userService: new UserService(db.pool),
        projectService: new ProjectsService(db.pool),
        taskService: new TasksService(db.pool),
    })
    next();
};

app.set('trust proxy', 1)
app.use(session(sessionOptions))
app.use(passport.initialize())
// app.use(passport.session())
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

app.use('/api/projects', services, projectsRouter);
app.use('/api/tasks', services, tasksRouter);
app.use('/api/user', services, userRouter)
app.use('/api/finance', services, financeRouter)

app.listen(Process.env.NODE_PORT, () => {
    console.log(`Listening on port ${Process.env.NODE_PORT}`);
});