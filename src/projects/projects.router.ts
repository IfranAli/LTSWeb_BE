import express, {NextFunction, Request, Response} from "express";
import {projectsService as service} from "./project.service";
import {respondError, respondOk} from "../generic/router.util";

const router = express.Router();

// GET projects/
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    service.findAll()
        .then(value => respondOk(res, value))
        .catch(err => respondError(res, err))
})

// GET projects/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const id: number = parseInt(req.params.id, 10);
    service.find(id)
        .then(value => respondOk(res, value))
        .catch(err => respondError(res, err))
})

export {router as projectsRouter}
