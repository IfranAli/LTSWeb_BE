import { dateToString, getFinanceSummary } from "./finance.util";
import { Finance } from "../typeorm/entities/Finance";
import { Category } from "../typeorm/entities/Category";
import { AppDataSource } from "../typeorm/data-source";
import {
  And,
  FindOperator,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  ValueTransformer,
} from "typeorm";
import { FinanceModel } from "./finance.interface";

export class FinanceService {
  private financeRepository = AppDataSource.getRepository(Finance);
  private categoryRepository = AppDataSource.getRepository(Category);

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

  // public matchCategory = (
  //   accountId: number,
  //   name: string
  // ): Promise<FinanceCategoryMatchResult[]> => {
  //   const values = [accountId, name.concat("%")];

  //   const query = `
  //           select C.*, count(ltswebdb.Finances.categoryType) as matches
  //           from ltswebdb.Finances
  //                    join Category C on Finances.categoryType = C.id
  //           where Finances.accountId = (?)
  //             and Finances.categoryType != 0
  //             and name like (?)
  //           group by categoryType
  //           order by matches DESC
  //           limit 10
  //       `;

  //   const result = this.runQuery(query, values).then((rows: []) => {
  //     return rows.map((row: any) => {
  //       const model: FinanceCategoryMatchResult = {
  //         category: {
  //           type: row.type,
  //           colour: row.colour,
  //           id: row.id,
  //         },
  //         matches: parseInt(row.matches),
  //       };
  //       return model;
  //     });
  //   });

  //   return result;
  // };

  public async getCategories(): Promise<Category[]> {
    const categories = await this.categoryRepository.find();
    return categories;
  }

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
    })

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

export const financeService = new FinanceService();
