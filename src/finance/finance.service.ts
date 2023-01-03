import {CrudService} from "../generic/crud.service";
import {FinanceModel} from "./finance.interface";

const safeFields: Array<keyof FinanceModel> = [
    "id",
    "name",
    "date",
    "amount",
    "categoryType",
];

class FinanceService extends CrudService<FinanceModel> {
    constructor() {
        super('Finances', safeFields);
    }

    public getCategories() {
        return this.runQuery('select * from Category');
    }
}

export const financeService = new FinanceService();