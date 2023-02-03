import {CrudService} from "../generic/crud.service";
import {FinanceModel} from "./finance.interface";
import {Pool} from "mariadb";

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

    public getCategories() {
        return this.runQuery('select * from Category');
    }

    public getFinancesByAccountID() {
        const values = [
            0,
            '2022-01-00 00:00:00',
            '2023-00-00 00:00:00'
        ]

        const query = `
            select *
            from ltswebdb.Finances
            where Finances.accountId = (?)
              and Finances.date > (?)
              and Finances.date < (?)
            order by Finances.date asc`

        return this.runQuery(query, values);
    }
}
