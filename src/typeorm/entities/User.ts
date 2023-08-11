import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  OneToMany,
} from "typeorm";
import { Account } from "./Account";
import { Project } from "./Project";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  token!: string;

  @OneToMany(() => Account, (account) => account.userId)
  accounts!: Account[];

  @OneToMany(() => Project, (project) => project.userId)
  projects!: Project[];
}
