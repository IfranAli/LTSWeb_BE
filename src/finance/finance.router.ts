import express, { Request, Response } from "express";
import { respondError, respondOk } from "../generic/router.util";
import { isAuthenticated } from "../user/user.router";
import { Finance } from "../typeorm/entities/Finance";
import { FinanceService } from "./finance.service";
import { AppDataSource } from "../typeorm/data-source";
import { Category } from "../typeorm/entities/Category";
import { Account } from "../typeorm/entities/Account";

const router = express.Router();

const financeService = new FinanceService(
  AppDataSource.getRepository(Account),
  AppDataSource.getRepository(Finance),
  AppDataSource.getRepository(Category)
);

// GET finance/
router.get("/", isAuthenticated, (req: Request, res: Response) => {
  financeService
    .getAllFinancesForAccount(req.userData?.id)
    .then((value) => {
      respondOk(res, value);
    })
    .catch((err) => respondError(res, err));
});

// DELETE finance/:id
router.delete("/:id", isAuthenticated, async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);

  financeService
    .deleteFinanceById(id)
    .then(() => {
      respondOk(res, {
        success: true,
        message: `Finance with id ${id} deleted successfully`,
      });
    })
    .catch((err) => respondError(res, err));
});

// GET finance/category
router.get("/category", isAuthenticated, async (req, res: Response) => {
  financeService
    .getCategories()
    .then((categories) => respondOk(res, categories))
    .catch((err) => respondError(res, err));
});

// GET finance/summary
router.get(
  "/summary/:id",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const from = new Date((req.query.from as string) ?? "");
    const to = new Date((req.query.to as string) ?? "");
    const accountId = parseInt(req.params.id, 10);

    financeService
      .getSummary(accountId, from, to)
      .then((summary) => {
        return respondOk(res, summary);
      })
      .catch((err) => respondError(res, err));
  }
);

// CREATE finance/
router.post("/", isAuthenticated, async (req: Request, res: Response) => {
  const body = req.body;

  financeService
    .createFinanceForAccount(req.userData?.id, body)
    .then((value) => respondOk(res, value))
    .catch((err) => respondError(res, err));

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
});

// GET finance/:id
router.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);

  financeService
    .getFinanceById(id)
    .then((value) => respondOk(res, value))
    .catch((err) => respondError(res, err));
});

// PUT finance/:id
router.put("/:id", isAuthenticated, async (req: Request, res: Response) => {
  const body = req.body;
  body.id = parseInt(req.params.id, 10);

  financeService
    .updateFinanceById(body.id, body)
    .then((value) => {
      respondOk(res, value);
    })
    .catch((err) => respondError(res, err));
});

// POST finance/:id
router.post("/:id", isAuthenticated, async (req: Request, res: Response) => {
  const body = req.body;
  const id: number = parseInt(req.params.id, 10);

  financeService
    .createFinanceForAccount(id, body)
    .then((value) => {
      respondOk(res, value);
    })
    .catch((err) => respondError(res, err));
});

export { router as financeRouter };
