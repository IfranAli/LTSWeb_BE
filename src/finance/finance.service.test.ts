import {FinanceService} from "./finance.service";
import {dateToString, IFinanceRange, IHasDate, resolveDatesToString} from "./finance.util";

jest.resetModules()

require('dotenv').config({
    path: '.env.development'
})

const db = require('../database');
const env = process.env

beforeEach(() => {

})

afterEach(() => {
    process.env = env
})

test('finances with date range', async () => {
    const service = new FinanceService(db.pool);

    const from = new Date('2023/01/01');
    const to = new Date('2023/02/01');
    const accountId = 0;

    const createFinanceRangeModel = (value: IHasDate) => {
        const model: IFinanceRange = {
            dateFrom: dateToString(from),
            dateTo: dateToString(to),
            values: resolveDatesToString(value)
        }

        return model;
    }

    const finances: [] = await service.getFinancesByAccountID(accountId, from, to).then(v => v);
    const financeRangeModel = finances.map((v: IHasDate) => createFinanceRangeModel(v));

    const categories = await service.getCategories().then(value => value);

    console.log(categories);
    console.log(finances);
})
