import {FinanceService} from "./finance.service";
import {getFinanceSummary} from "./finance.util";

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

    const from = new Date('2020/01/01');
    const to = new Date('2024/02/01');
    const accountId = 0;


    const finances = await service.getFinancesByAccountID(accountId, from, to).then(v => v);
    const categories = await service.getCategories().then(value => value);

    const summary = getFinanceSummary(finances, categories);
})
