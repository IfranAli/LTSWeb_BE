import express, { Request, Response } from "express";
import {
  respondError,
  respondOk,
  respondServerError,
} from "../generic/router.util";
import { isAuthenticated } from "../user/user.router";
import { Finance } from "../typeorm/entities/Finance";
import { FinanceService } from "./finance.service";
import { AppDataSource } from "../typeorm/data-source";
import { Category } from "../typeorm/entities/Category";
import { Account } from "../typeorm/entities/Account";
import { parseDate, parseNumber } from "../validation-util";

const router = express.Router();

const financeService = new FinanceService(
  AppDataSource.getRepository(Account),
  AppDataSource.getRepository(Finance),
  AppDataSource.getRepository(Category)
);

// GET finance/test
router.get("/test", isAuthenticated, async (req: Request, res: Response) =>
  financeService
    .testQuery()
    .then((value) => respondOk(res, value))
    .catch((err) => respondError(res, err))
);

// #region /finance/search
router.get("/search", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const queryAccountId = parseNumber(req.query.accountId);

    const accounts = await financeService.getAccountByUserId(req.userData.id);
    const accountId = accounts.find((a) => a.id === queryAccountId)?.id ?? -1;

    if (accountId === -1) {
      return respondError(res, new Error("Account not found"));
    }

    const queryDateFrom: Date = parseDate(req.query.from as string);
    const queryDateTo: Date = parseDate(req.query.to as string);

    if (queryDateFrom && queryDateTo) {
      const result = await financeService.getFinancesBetweenDates(
        accountId,
        queryDateFrom,
        queryDateTo
      );
      return respondOk(res, result);
    }

    return res.status(400).send("Invalid date range");
  } catch (error) {
    console.error("Error in /finance/search:", error);
    return respondServerError(res, error);
  }
});
// #endregion - /finance/search

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
  const data = Array.isArray(body) ? body : [body];
  financeService
    .createFinanceForAccountMany(req.userData?.id, data)
    .then((value) => respondOk(res, { body: value }))
    .catch((err) => respondError(res, err));
});

// GET finance/category/match/:type
router.get(
  "/category/match/:type",
  isAuthenticated,
  async (req: Request, res: Response) => {
    const type = req.params.type;

    const r = await financeService.findCategoryByFinanceName(0, type);

    const result = {
      type: type,
      "matches:": r,
    };
    return respondOk(res, {
      result,
    });
  }
);

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

export { router as financeRouter };
