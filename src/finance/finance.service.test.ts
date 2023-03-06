import {FinanceService} from "./finance.service";
import {getFinanceSummary} from "./finance.util";
import {FinanceCategoryMatchResult, FinanceDatabaseModel} from "./finance.interface";

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

test('should update unknown finances with suitable category for input name', async () => {
    const service = new FinanceService(db.pool);

    const uncategorised: FinanceDatabaseModel[] = await service.findAllFinancesOfCategory(0, 'Unkown')

    const updates: Partial<FinanceDatabaseModel>[] = [];

    for (const value of uncategorised) {
        const name = value.name;
        const accountId = 0;
        const matchCategory = await service.matchCategory(accountId, name).then(v => v);

        if (matchCategory.length > 0) {
            updates.push({
                id: value.id,
                categoryType: matchCategory.pop()?.category.id ?? value.categoryType
            })
        }
    }

    const result = await service.updateMany(updates as any[]);
})

test('Should match finance name to nearest category', async () => {
    const service = new FinanceService(db.pool);

    const name = 'ub'
    const accountId = 0;
    const matchCategory = await service.matchCategory(accountId, name).then(v => v);

    expect(matchCategory.length).toBeGreaterThan(0);
    expect<FinanceCategoryMatchResult>(matchCategory[0])
    console.log(matchCategory);
})