import express, { NextFunction, Request, Response } from "express";
import { respondError, respondOk } from "../generic/router.util";
import { isAuthenticated } from "../user/user.router";
import { getFinanceSummary, isValidDateObject } from "./finance.util";
import { FinanceDatabaseModel } from "./finance.interface";
import { ResponseMessage } from "../generic/ResponseMessage.interface";
import { Finance } from "../typeorm/entities/Finance";
import { financeService } from "./finance.service";
import { AppDataSource } from "../typeorm/data-source";

const router = express.Router();

// GET finance/
router.get("/", isAuthenticated, (req: Request, res: Response) => {
  const financeRepository = AppDataSource.getRepository(Finance);

  financeRepository
    .findBy({ accountId: req.userData?.id })
    .then((value) => respondOk(res, value))
    .catch((err) => respondError(res, err));
});

// // DELETE finance/:id
// router.delete(
//   "/:id",
//   isAuthenticated,
//   async (req: Request, res: Response, next: NextFunction) => {
//     const id: number = parseInt(req.params.id, 10);
//     req.services.financeService
//       .delete(id)
//       .then((_) => {
//         const responseMessage: ResponseMessage = {
//           success: true,
//           message: "",
//         };
//         respondOk(res, responseMessage);
//       })
//       .catch((err) => respondError(res, err));
//   }
// );

// GET finance/category
router.get("/category", isAuthenticated, async (req, res: Response) => {
  const categories = await financeService.getCategories();
  return respondOk(res, categories);
});

// GET finance/summary
router.get(
  "/summary/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const from = new Date((req.query.from as string) ?? "");
    const to = new Date((req.query.to as string) ?? "");
    const accountId = parseInt(req.params.id, 10);

    // todo: grab accountId from route param.
    // if (!(accountId && isValidDateObject(from) && isValidDateObject(to))) {
    //   return respondError(res, "missing params");
    // }

    // const finances = await req.services.financeService
    //   .getFinancesByAccountID(accountId, from, to)
    //   .then((v) => v);
    // const categories = await req.services.financeService
    //   .getCategories()
    //   .then((value) => value);

    // const summary = getFinanceSummary(finances, categories);

    const summary = await financeService.getSummary(accountId, from, to);
    return respondOk(res, summary);
  }
);

// // CREATE finance/
// router.post(
//   "/",
//   isAuthenticated,
//   async (req: Request, res: Response, next: NextFunction) => {
//     const body = req.body;

//     const financeModelsFn = async (
//       accum: Promise<Partial<FinanceDatabaseModel>[]>,
//       value: Partial<FinanceDatabaseModel>
//     ) => {
//       const arr = await Promise.resolve(accum);

//       if (
//         (!value.categoryType || value.categoryType == 0) &&
//         (value.name?.length ?? 0 > 0)
//       ) {
//         const matchCategory = await req.services.financeService.matchCategory(
//           0,
//           value.name ?? ""
//         );
//         const newCategory =
//           matchCategory.pop()?.category.id ?? value.categoryType;

//         if (newCategory != 0) {
//           return [...arr, { ...value, categoryType: newCategory }];
//         }
//       }

//       return [...arr, value];
//     };

//     if (Array.isArray(body)) {
//       const financeModels = await body.reduce<
//         Promise<Partial<FinanceDatabaseModel>[]>
//       >((a, b) => {
//         return financeModelsFn(a, b);
//       }, Promise.resolve([]));

//       return req.services.financeService
//         .createMany(financeModels as any)
//         .then((value) => respondOk(res, value))
//         .catch((err) => respondError(res, err));
//     } else {
//       const financeModels = await [body].reduce<
//         Promise<Partial<FinanceDatabaseModel>[]>
//       >((a, b) => {
//         return financeModelsFn(a, b);
//       }, Promise.resolve([]));

//       return req.services.financeService
//         .create(financeModels.pop() as any)
//         .then((value) => respondOk(res, value))
//         .catch((err) => respondError(res, err));
//     }
//   }
// );

// // GET finance/:id
// router.get(
//   "/:id",
//   isAuthenticated,
//   async (req: Request, res: Response, next: NextFunction) => {
//     const id: number = parseInt(req.params.id, 10);

//     req.services.financeService
//       .find(id)
//       .then(async (resultArray) => respondOk(res, resultArray.shift()!))
//       .catch((err) => respondError(res, err));
//   }
// );

// // PUT finance/:id
// router.put(
//   "/:id",
//   isAuthenticated,
//   async (req: Request, res: Response, next: NextFunction) => {
//     const body = req.body;
//     body.id = parseInt(req.params.id, 10);

//     req.services.financeService
//       .update(body)
//       .then((value) => respondOk(res, value))
//       .catch((err) => respondError(res, err));
//   }
// );

// // POST finance/:id
// router.post(
//   "/:id",
//   isAuthenticated,
//   async (req: Request, res: Response, next: NextFunction) => {
//     const body = req.body;
//     const id: number = parseInt(req.params.id, 10);
//     body.id = parseInt(req.params.id, 10);

//     req.services.financeService
//       .create(body)
//       .then((value) => respondOk(res, value))
//       .catch((err) => respondError(res, err));
//   }
// );

export { router as financeRouter };
