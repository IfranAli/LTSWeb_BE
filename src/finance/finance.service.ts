import { getFinanceSummary } from "./finance.util";
import { Finance } from "../typeorm/entities/Finance";
import { Category } from "../typeorm/entities/Category";
import { And, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { Account } from "../typeorm/entities/Account";
import { parseNumber } from "../validation-util";
import { FinanceModel } from "./finance.interface";
import { runRawSqlQuery } from "../db/db-util";

type CategoryMatch = Category & { matches: number };

export const parseStrToFloat = (str: string): number => {
  const result = parseFloat(str);
  return isNaN(result) ? 0 : result;
};

export class FinanceService {
  constructor(
    private accountRepository: Repository<Account>,
    private financeRepository: Repository<Finance>,
    private categoryRepository: Repository<Category>
  ) {}

  // Test function
  public async testQuery(): Promise<FinanceModel[]> {
    const results = await runRawSqlQuery<FinanceModel, [number]>(
      "SELECT * FROM finance WHERE accountId = ?",
      [0]
    );
    return results;
  }

  //#region Account
  async getAccountByUserId(userId: number): Promise<Account[]> {
    try {
      const accounts = await this.accountRepository.findBy({
        userId: userId,
      });

      return accounts;
    } catch (error) {
      console.error("Error in getAccountForUser: ", error);
      return Promise.reject(error as Error);
    }
  }

  async createAccountForUser(userId: number): Promise<Account> {
    try {
      const account = new Account();
      account.userId = userId;
      account.total = 0;
      return await this.accountRepository.save(account);
    } catch (error) {
      console.error("Error in createAccountForUser: ", error);
      return Promise.reject(error as Error);
    }
  }

  //#endregion

  //#region Finance
  async getAllFinancesForAccount(accountId: number): Promise<Finance[]> {
    try {
      const finances = await this.financeRepository.findBy({
        accountId: accountId,
      });
      return finances;
    } catch (error) {
      console.error("Error in getAllFinancesForAccount: ", error);
      return Promise.reject(error as Error);
    }
  }

  // #region util
  mapInputFinanceToDbModel = (
    f: Partial<Finance>,
    account: Account
  ): Partial<Finance> => {
    return {
      amount: f.amount ?? 0,
      date: f.date ?? new Date(),
      categoryType: f.categoryType ?? 0,
      name: f.name ?? "",
      account: account,
      accountId: account.id,
    };
  };

  async populateFinanceWithCategory(
    finance: Partial<Finance>
  ): Promise<Partial<Finance>> {
    if (
      finance.accountId != null &&
      finance.categoryType === 0 &&
      finance.name &&
      finance.name.length > 0
    ) {
      const matches = await this.findCategoryByFinanceName(
        finance.accountId,
        finance.name
      );
      const match = matches.sort((a, b) => b.matches - a.matches)[0];

      if (match) {
        finance.categoryType = match.id;
      }
    }

    return finance;
  }

  //#endregion util

  async createFinanceForAccountMany(
    userId: number,
    data: Partial<Finance>[]
  ): Promise<Finance[]> {
    try {
      const accounts = await this.getAccountByUserId(userId);
      const account = accounts[0];

      console.debug("Creating finances for account:", account);

      if (!account) {
        throw new Error("Account not found");
      }

      const finances = await Promise.all(
        data.map((d) =>
          this.populateFinanceWithCategory(
            this.mapInputFinanceToDbModel(d, account)
          )
        )
      );

      return await this.financeRepository.save(finances);
    } catch (error) {
      console.error("Error in createFinanceForAccountMany: ", error);
      return Promise.reject(error as Error);
    }
  }

  async deleteFinanceById(id: number): Promise<void> {
    try {
      await this.financeRepository.delete(id);
    } catch (error) {
      console.error("Error in deleteFinanceById: ", error);
      return Promise.reject(error as Error);
    }
  }

  async getFinanceById(param_id: number): Promise<Finance> {
    try {
      const id = parseNumber(param_id);
      const finance = await this.financeRepository.findOneOrFail({
        where: { id },
      });
      return finance;
    } catch (error) {
      console.error("Error in getFinanceById: ", error);
      return Promise.reject(error as Error);
    }
  }

  async updateFinanceById(
    id: number,
    data: Partial<Finance>
  ): Promise<Finance> {
    try {
      const finance = await this.getFinanceById(id);

      if (!finance) {
        throw new Error("Finance not found");
      }

      Object.assign(finance, data);
      return this.financeRepository.save(finance);
    } catch (error) {
      console.error("Error in updateFinance: ", error);
      return Promise.reject(error as Error);
    }
  }

  //#endregion

  //#region Category

  async getCategories(): Promise<Category[]> {
    try {
      const categories = await this.categoryRepository.find();
      return categories;
    } catch (error) {
      console.error("Error in getCategories: ", error);
      return Promise.reject(error as Error);
    }
  }

  async getCategoryById(id: number): Promise<Category> {
    try {
      const category = await this.categoryRepository.findOneOrFail({
        where: { id },
      });
      return category;
    } catch (error) {
      console.error("Error in getCategoryById: ", error);
      return Promise.reject(error as Error);
    }
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    try {
      const type = data.type ?? "";

      if (type.length === 0) {
        throw new Error("Category type cannot be empty");
      }

      const existingCategory = await this.categoryRepository.findOne({
        where: { type: data.type },
      });

      if (existingCategory) {
        throw new Error("Category already exists");
      }

      const params: Partial<Category> = {
        type: data.type ?? "",
        colour: data.colour ?? "",
      };

      return await this.categoryRepository.save(params);
    } catch (error) {
      console.error("Error in createCategory: ", error);
      return Promise.reject(error as Error);
    }
  }

  public async findCategoryByFinanceName(
    accountId: number,
    name: string
  ): Promise<CategoryMatch[]> {
    const query = `
    select C.id, C.type, C.colour, count(F.categoryType) as matches
    from finance F
    join category C on F.categoryType = C.id
    where F.accountId = ? 
      and F.categoryType != 0
      and F.name like ? 
    GROUP BY F.categoryType
    limit 10;
    `;

    const matches = (await this.financeRepository.query(query, [
      accountId,
      `%${name}%`,
    ])) as CategoryMatch[];

    return matches;
  }

  //#endregion

  public async getFinancesBetweenDates(
    accountId: number,
    from: Date,
    to: Date
  ): Promise<Finance[]> {
    try {
      const finances = await this.financeRepository.find({
        where: {
          accountId: accountId,
          date: And(LessThanOrEqual(to), MoreThanOrEqual(from)),
        },
      });
      return finances;
    } catch (error) {
      console.error("Error in getFinancesBetweenDates: ", error);
      return Promise.reject(error as Error);
    }
  }

  public async getSummary(accountId: number, from: Date, to: Date) {
    // get finances by account id
    const finances = await this.getFinancesBetweenDates(accountId, from, to);

    const financeModels = finances.map((f) => {
      return {
        ...f,
        // date: dateToString(f.date),
        date: f.date,
        amount: f.amount,
      };
    });

    const categories = await this.getCategories();
    const summary = getFinanceSummary(financeModels, categories);

    return summary;
  }
}
