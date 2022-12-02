import express, {NextFunction, Request, Response} from "express";
import {projectsService as service} from "./project.service";
import {tasksService} from "../tasks/task.service";
import {respondError, respondOk} from "../generic/router.util";
import {ProjectModel} from "./project.interface";

const router = express.Router();

// GET projects/
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    service.findAll().then(async projects =>
        Promise.all(projects.map(async (project) => {
            return project;
            // const projectResult: Partial<ProjectModel> = {
            //     ...project,
            //     tasks: await service.getTasksByProjectID(project.id)
            // }
            // return projectResult;
        })))
        .then(value => respondOk(res, value))
        .catch(err => respondError(res, err));

});

// CREATE projects/
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    service.create(body)
        .then(value => respondOk(res, value))
        .catch(err => respondError(res, err))
});

// GET projects/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const id: number = parseInt(req.params.id, 10);
    service.find(id)
        .then(async (resultArray) => {
            const project = resultArray.shift()!;
            let projectWithTasks: Partial<ProjectModel> = {
                ...project,
                tasks: await service.getTasksByProjectID(project.id)
            }
            return respondOk(res, projectWithTasks);
        })
        .catch(err => respondError(res, err))
})

// POST projects/:id
router.post('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const id: number = parseInt(req.params.id, 10);

    tasksService.create(body)
        .then(value => respondOk(res, value))
        .catch(err => respondError(res, err))
})

// GET projects/:id/tasks
router.get('/:id/tasks', async (req: Request, res: Response, next: NextFunction) => {
    const id: number = parseInt(req.params.id, 10);
    service.getTasksByProjectID(id)
        .then(value => respondOk(res, value))
        .catch(err => respondError(res, err))
})

export {router as projectsRouter}
