import express, {Request, Response} from "express";
import {tasksService, tasksService as service} from "./task.service";
import {respondError, respondOk} from "../generic/router.util";
import {ResponseMessage} from "../generic/ResponseMessage.interface";
import {OkPacket} from "../generic/crud.service";
import {isAuthenticated} from "../user/user.router";

const router = express.Router();

// GET tasks/
router.get('/', isAuthenticated,
    async (req: Request, res: Response) => {
        service.findAll()
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
    })

// GET tasks/:id
router.get('/:id', isAuthenticated,
    async (req: Request, res: Response) => {
        const id: number = parseInt(req.params.id, 10);
        service.find(id)
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
    })

// DELETE tasks/:id
router.delete('/:id', isAuthenticated,
    async (req: Request, res: Response) => {
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
router.put('/:id', isAuthenticated,
    async (req: Request, res: Response) => {
        const body = req.body;
        body.id = parseInt(req.params.id, 10);

        tasksService.update(body)
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
    })

export {router as tasksRouter}