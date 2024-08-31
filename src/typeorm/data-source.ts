import "reflect-metadata";
import { DataSource } from "typeorm";
import { Account } from "./entities/Account";
import { CalendarEvent } from "./entities/CalendarEvent";
import { Category } from "./entities/Category";
import { Finance } from "./entities/Finance";
import { Project } from "./entities/Project";
import { Task } from "./entities/Task";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
  type: "mariadb",
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Project, Task, Account, Finance, Category, CalendarEvent],
  synchronize: true,
  logging: false,
});