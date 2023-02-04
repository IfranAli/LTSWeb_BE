import {CrudService} from "../generic/crud.service";
import {FinanceCategoryModel, FinanceModel} from "./finance.interface";
import {Pool} from "mariadb";
import {dateToString} from "./finance.util";

const safeFields: Array<keyof FinanceModel> = [
    "id",
    "name",
    "date",
    "amount",
    "categoryType",
];

export class FinanceService extends CrudService<FinanceModel> {
    constructor(pool: Pool) {
        super(pool, 'Finances', safeFields);
    }

    public getCategories(): Promise<FinanceCategoryModel[]> {
        return this.runQuery('select * from Category');
    }

    public getFinancesByAccountID(accountId: number, from: Date, to: Date): Promise<FinanceModel[]> {
        const values = [
            accountId,
            dateToString(from),
            dateToString(to),
        ]

        const query = `
            select *
            from ltswebdb.Finances
            where Finances.accountId = (?)
              and Finances.date > (?)
              and Finances.date < (?)
            order by Finances.date asc`

        return this.runQuery(query, values).then((rows: []) => {

            return rows.map((row: any) => {
                const model: FinanceModel = {
                    ...row,
                    date: dateToString(new Date(row.date)),
                    amount: (parseFloat(row.amount) ?? 0),
                }

                return model;
            });
        })
    }
}
