import { DataSource, ObjectLiteral, Repository } from "typeorm";

// dev env setup
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

// import dev test db data source
import { TestAppDataSource } from "../src/typeorm/data-source";

export class TestHelper {
  private static _instance: TestHelper;
  public dataSource: DataSource | null = null;

  constructor() {
    this.dataSource = TestAppDataSource;
  }

  public static get Instance(): TestHelper {
    if (!this._instance) {
      this._instance = new TestHelper();
    }

    return this._instance;
  }

  async setupTestDB() {
    if (this.dataSource && !this.dataSource?.isInitialized) {
      console.log("Setting up test database");

      return await this.dataSource
        .initialize()
        .then((connection) => {
          console.log("Connection to test database established");
          return connection;
        })
        .catch((reason) => {
          console.error(reason);
          throw new Error("Connection to test database failed");
        });
    }

    console.debug("Test database already initialized");
  }

  tearDown() {
    if (this.dataSource?.isInitialized) {
      console.log("Tearing down test database");
      this.dataSource?.destroy();
    }

    console.debug("Cannot tear down test database, it is not initialized");
  }

  public getRepository<T extends ObjectLiteral>(
    entity: new () => T
  ): Repository<T> {
    if (!this.dataSource) {
      this.setupTestDB();
    }

    const repo = this.dataSource?.getRepository(entity);

    if (!repo) {
      throw new Error("Repository not found");
    }

    return repo;
  }

  async clear() {
    this.dataSource?.entityMetadatasMap.forEach(async (entity) => {
      const repository = this.dataSource!.getRepository(entity.name);
      await repository.delete({});
    });
  }
}
