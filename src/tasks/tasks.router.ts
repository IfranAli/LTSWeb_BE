import express, {NextFunction, Request, Response} from "express";
import {tasksService, tasksService as service} from "./task.service";
import {respondError, respondOk} from "../generic/router.util";
import {ResponseMessage} from "../generic/ResponseMessage.interface";
import {OkPacket} from "../generic/crud.service";

const router = express.Router();

// GET tasks/
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    service.findAll()
        .then(value => respondOk(res, value))
        .catch(err => respondError(res, err))
})

// GET tasks/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const id: number = parseInt(req.params.id, 10);
    service.find(id)
        .then(value => respondOk(res, value))
        .catch(err => respondError(res, err))
})

// DELETE tasks/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const id: number = parseInt(req.params.id, 10);
    tasksService.delete(id)
        .then((value: OkPacket) => {
            const responseMessage: ResponseMessage = {
                success: true,
                message: '',
            }
            respondOk(res, responseMessage)
        })
        .catch(err => respondError(res, err))
})

// PUT tasks/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;
    const id: number = parseInt(req.params.id, 10);
    body.id = id;

    tasksService.update(body)
        .then(value => respondOk(res, value))
        .catch(err => respondError(res, err))
})

export {router as tasksRouter}