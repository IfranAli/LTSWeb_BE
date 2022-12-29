import {CrudService} from "../generic/crud.service";
import {FinanceModel} from "./finance.interface";

const safeFields: Array<keyof FinanceModel> = [
    "id",
    "name",
    "date",
    "amount",
    "type",
];

class FinanceService extends CrudService<FinanceModel> {
    constructor() {
        super('Finances', safeFields);
    }
}

export const financeService = new FinanceService();