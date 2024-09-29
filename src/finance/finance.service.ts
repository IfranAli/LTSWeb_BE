import { dateToString, getFinanceSummary } from "./finance.util";
import { Finance } from "../typeorm/entities/Finance";
import { Category } from "../typeorm/entities/Category";
import { And, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { FinanceModel } from "./finance.interface";
import { Account } from "../typeorm/entities/Account";

type CategoryMatch = Category & { matches: number };

export class FinanceService {
  constructor(
    private accountRepository: Repository<Account>,
    private financeRepository: Repository<Finance>,
    private categoryRepository: Repository<Category>
  ) {}

  //#region Account
  async getAccountForUser(userId: number): Promise<Account> {
    try {
      const account = await this.accountRepository.findOneOrFail({
        where: { userId: userId },
      });
      return account;
    } catch (error) {
      console.error("Error in getAccountForUser: ", error);
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
      const account = await this.getAccountForUser(userId);

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

  async createFinanceForAccount(
    userId: number,
    data: Partial<Finance>
  ): Promise<Finance> {
    try {
      const account = await this.getAccountForUser(userId);

      if (!account) {
        throw new Error("Account not found");
      }

      const params = await this.populateFinanceWithCategory(
        this.mapInputFinanceToDbModel(data, account)
      );

      const finance = await this.financeRepository.save(params);
      return finance;
    } catch (error) {
      console.error("Error in createFinanceForAccount: ", error);
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

  async getFinanceById(id: number): Promise<Finance> {
    try {
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

  // public getAccountsByUserId = (userId: number): Promise<number[]> => {
  //   const values = [userId];

  //   const query = `
  //           select id
  //           from Accounts
  //           where userId = (?);
  //       `;

  //   return this.runQuery(query, values).then((rows: []) => {
  //     return rows.map((row: any) => {
  //       return row.id;
  //     });
  //   });
  // };

  // public findCategoryByType = (
  //   type: string
  // ): Promise<FinanceCategoryModel[]> => {
  //   const values = [["%", type, "%"].join("")];

  //   const query = `
  //           select *
  //           from Category
  //           where Category.type like (?)
  //           limit 10;
  //       `;

  //   return this.runQuery(query, values);
  // };

  // public findAllFinancesOfCategory = async (
  //   accountId: number,
  //   type: string
  // ): Promise<FinanceDatabaseModel[]> => {
  //   const r = await this.findCategoryByType("Unknown");
  //   const categoryType = r.pop()?.type ?? null;

  //   if (!categoryType) {
  //     throw new Error(`Category of type ${type} not found.`);
  //   }

  //   const category = 0;
  //   const values = [accountId, category];

  //   const query = `
  //           select *
  //           from Finances as F
  //           where F.accountId = (?)
  //             and F.categoryType = (?);
  //       `;

  //   const result = this.runQuery(query, values);

  //   return result;
  // };

  public async getSummary(accountId: number, from: Date, to: Date) {
    // get finances by account id
    const finances: Finance[] = await this.financeRepository.find({
      where: {
        accountId: accountId,
        date: And(LessThanOrEqual(to), MoreThanOrEqual(from)),
      },
    });

    const financeModels: FinanceModel[] = finances.map((f) => {
      return {
        ...f,
        date: dateToString(f.date),
        amount: f.amount,
      };
    });

    const categories = await this.getCategories();
    const summary = getFinanceSummary(financeModels, categories);

    return summary;
  }

  // public getFinancesByAccountID(
  //   accountId: number,
  //   from: Date,
  //   to: Date
  // ): Promise<FinanceModel[]> {
  //   const values = [accountId, dateToString(from), dateToString(to)];

  //   const query = `
  //           select *
  //           from ltswebdb.finance
  //           where finance.accountId = (?)
  //             and finance.date >= (?)
  //             and finance.date <= (?)
  //           order by finance.date asc`;

  //   return this.runQuery(query, values).then((rows: []) => {
  //     return rows.map((row: any) => {
  //       const model: FinanceModel = {
  //         ...row,
  //         date: dateToString(new Date(row.date)),
  //         amount: parseFloat(row.amount) ?? 0,
  //       };

  //       return model;
  //     });
  //   });
  // }
}
