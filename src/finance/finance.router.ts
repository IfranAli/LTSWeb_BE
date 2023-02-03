import express, {NextFunction, Request, Response} from "express";
import {respondError, respondOk} from "../generic/router.util";
import {isAuthenticated} from "../user/user.router";
// import {financeService as service} from "./finance.service";

const router = express.Router();

// GET finance/
router.get('/', isAuthenticated,
    (req: Request, res: Response, next: NextFunction) =>
        req.services.financeService
            .findAll()
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
);

// GET finance/category
router.get('/category', isAuthenticated,
    (req, res: Response, next: NextFunction) =>
        req.services.financeService.getCategories()
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
);

// CREATE finance/
router.post('/', isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;

        req.services.financeService.create(body)
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
    });

// GET finance/:id
router.get('/:id', isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
        const id: number = parseInt(req.params.id, 10);
        req.services.financeService.find(id)
            .then(async (resultArray) =>
                respondOk(res, resultArray.shift()!))
            .catch(err => respondError(res, err))
    })

// PUT finance/:id
router.put('/:id', isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        body.id = parseInt(req.params.id, 10);

        req.services.financeService.update(body)
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
    })

// POST finance/:id
router.post('/:id', isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body;
        const id: number = parseInt(req.params.id, 10);
        body.id = parseInt(req.params.id, 10);

        req.services.financeService.create(body)
            .then(value => respondOk(res, value))
            .catch(err => respondError(res, err))
    })

export {router as financeRouter}
