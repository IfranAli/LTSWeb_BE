import { Project } from "../src/typeorm/entities/Project";
import { User } from "../src/typeorm/entities/User";
import { TestHelper } from "./TestHelper";

const userRepository = TestHelper.Instance.getRepository(User);
const projectRepository = TestHelper.Instance.getRepository(Project);

let user: User = null;

beforeAll(async () => {
  await TestHelper.Instance.setupTestDB();
  user = await userRepository.findOneByOrFail({ username: "testuser" });
});

afterAll(() => {
  TestHelper.Instance.tearDown();
});

describe("Project CRUD", () => {
  it("should create a project", async () => {
    const project = await projectRepository.save({
      title: "Test Project",
      description: "Test Project Description",
      colour: "#FFFFFF",
      priority: 1,
      code: "TP",
      enabled: true,
      userId: user.id,
    });

    expect(project).toBeDefined();
  });
});
