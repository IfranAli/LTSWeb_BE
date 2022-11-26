import express, {NextFunction, Request, Response} from "express";
import {projectsService as service} from "./project.service";
import {respondError, respondOk} from "../generic/router.util";

const router = express.Router();

// GET projects/
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    service.findAll().then(async projects =>
        Promise.all(projects.map(async project => ({
            ...project, Tasks: await service.getTasksByProjectID(project.id)
        }))))
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
        .then(async (result) => {
            const project = result.shift()!;

            return respondOk(res, {
                ...project,
                Tasks: await service.getTasksByProjectID(project.id)
            });
        })
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
