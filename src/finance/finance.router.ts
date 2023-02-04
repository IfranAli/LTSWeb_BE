import express, {NextFunction, Request, Response} from "express";
import {respondError, respondOk} from "../generic/router.util";
import {isAuthenticated} from "../user/user.router";
import {getFinanceSummary, isValidDateObject} from "./finance.util";

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

// GET finance/summary
router.get('/summary/:id', isAuthenticated,
    async (req: Request, res: Response, next: NextFunction) => {
        const from = new Date(req.query.from as string ?? '');
        const to = new Date(req.query.to as string ?? '');
        const accountId = req.query.accountId as unknown as number ?? null;

        if (!(accountId && isValidDateObject(from) && isValidDateObject(to))) {
            return respondError(res, 'missing params');
        }

        const finances = await req.services.financeService.getFinancesByAccountID(accountId, from, to).then(v => v);
        const categories = await req.services.financeService.getCategories().then(value => value);

        const summary = getFinanceSummary(finances, categories);

        return respondOk(res, summary);
    }
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
