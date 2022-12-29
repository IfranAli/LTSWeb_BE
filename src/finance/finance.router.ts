import express, {NextFunction, Request, Response} from "express";
import {respondError, respondOk} from "../generic/router.util";
import {isAuthenticated} from "../user/user.router";
import {financeService as service} from "./finance.service";

const router = express.Router();

// GET finance/
router.get('/', isAuthenticated,
    (req: Request, res: Response, next: NextFunction) =>
        service.findAll()
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
);

// CREATE finance/
router.post('/', isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;

        service.create(body)
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
    });

// GET finance/:id
router.get('/:id', isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
        const id: number = parseInt(req.params.id, 10);
        service.find(id)
            .then(async (resultArray) =>
                respondOk(res, resultArray.shift()!))
            .catch(err => respondError(res, err))
    })

// PUT finance/:id
router.put('/:id', isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        body.id = parseInt(req.params.id, 10);

        service.update(body)
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
    })

// POST finance/:id
router.post('/:id', isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const id: number = parseInt(req.params.id, 10);
        body.id = parseInt(req.params.id, 10);

        service.create(body)
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
    })

export {router as financeRouter}
