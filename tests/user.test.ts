import { User } from "../src/typeorm/entities/User";
import { TestHelper } from "./TestHelper";

beforeAll(async () => {
  await TestHelper.Instance.setupTestDB();
});

afterAll(() => {
  TestHelper.Instance.tearDown();
});

describe("UserService", () => {
  const userRepository = TestHelper.Instance.getRepository(User);

  test("should save user to database", async () => {
    const user = await userRepository.save({
      username: "testuser",
      name: "Test User",
      password: "testpassword",
      email: "test@tester.com.au",
      firstName: "Test",
      lastName: "User",
      token: "testtoken",
    });

    expect(user).toBeDefined();
  });

  test("should find user", async () => {
    await userRepository
      .findOneByOrFail({ username: "testuser" })
      .then((user) => {
        expect(user).toBeDefined();
      });

    const result = await userRepository.find().then((users) => users);
    expect(result.length).toBeGreaterThan(0);
  });
});
