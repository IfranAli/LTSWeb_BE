import { Finance } from "../../src/typeorm/entities/Finance";
import { TestHelper } from "../TestHelper";

import { FinanceService } from "../../src/finance/finance.service";
import { Account } from "../../src/typeorm/entities/Account";
import { Category } from "../../src/typeorm/entities/Category";
import { User } from "../../src/typeorm/entities/User";
import { TestAppDataSource } from "../../src/typeorm/data-source";

beforeAll(async () => {
  await TestHelper.Instance.setupTestDB();
});

afterAll(() => {
  TestHelper.Instance.tearDown();
});

const userRepository = TestHelper.Instance.getRepository(User);

describe("FinanceService", () => {
  const financeService = new FinanceService(
    TestAppDataSource.getRepository(Account),
    TestAppDataSource.getRepository(Finance),
    TestAppDataSource.getRepository(Category)
  );

  test("Should get user and create account", async () => {
    const testUser: User = await userRepository.findOneOrFail({
      where: { username: "testuser" },
    });

    expect(testUser).toBeDefined();
    console.debug("testUser: ", testUser);

    let account: Account | undefined = await financeService
      .getAccountByUserId(testUser.id)
      .catch((error) => {
        console.error(`Account not found for user ${testUser.id}: `, error);
        return Promise.resolve(undefined);
      });

    if (!account) {
      account = await financeService.createAccountForUser(testUser.id);
      expect(account).toBeDefined();
    }

    console.debug("Account: ", account);

    const data: Partial<Finance>[] = [
      {
        name: "Test Expense 1",
        amount: 100.0,
        categoryType: 1,
        date: new Date("2025-02-10 13:30:00"),
      },
      {
        name: "Test Expense 2",
        amount: 200.0,
        categoryType: 2,
        date: new Date("2025-02-11 23:45:00"),
      },
    ];

    // Add expense to account
    const expense = await financeService.createFinanceForAccountMany(
      testUser.id,
      data
    );

    // Fetch all expenses for account
    const expenses = await financeService.getAllFinancesForAccount(account.id);
    console.debug("Expenses: ", expenses);
  }, 10000);
});
