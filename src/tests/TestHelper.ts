import {
  DataSource,
  DataSourceOptions,
  ObjectLiteral,
  Repository,
} from "typeorm";

// Using environemnt variables
import dotenv from "dotenv";
import { Account } from "../typeorm/entities/Account";
import { Category } from "../typeorm/entities/Category";
import { Finance } from "../typeorm/entities/Finance";
import { Project } from "../typeorm/entities/Project";
import { Task } from "../typeorm/entities/Task";
import { User } from "../typeorm/entities/User";
dotenv.config({ path: ".env.development" });

export class TestHelper {
  private static _instance: TestHelper;

  private constructor() {}

  public static get Instance(): TestHelper {
    return this._instance || (this._instance = new this());
  }

  public dataSource: DataSource | null = null;

  private testDbConfig: DataSourceOptions = {
    type: "mariadb",
    host: "localhost",
    port: 3306,
    username: "ltsweb",
    password: "LD_B_WeB@",
    database: "ltswebtest",
    entities: ["src/typeorm/entities/*.ts"],
    synchronize: true,
    logging: false,
  };

  public getRepository<T extends ObjectLiteral>(entity: {
    new (): T;
  }): Repository<T> {
    if (!this.dataSource) {
      this.setuptTestDB();
    }

    const repo = this.dataSource?.getRepository(entity);

    if (!repo) {
      throw new Error("Repository not found");
    }

    return repo;
  }

  async setuptTestDB() {
    this.dataSource = new DataSource(this.testDbConfig);
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

  teardown() {
    this.dataSource?.destroy();
  }

  async clear() {
    this.dataSource?.entityMetadatasMap.forEach(async (entity) => {
      const repository = this.dataSource!.getRepository(entity.name);
      await repository.delete({});
    });
  }
}
