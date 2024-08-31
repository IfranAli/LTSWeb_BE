import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Finance } from "./Finance";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  total!: number;

  @ManyToOne(() => User, (user) => user.accounts)
  user!: User;

  @OneToMany(() => Finance, (finance) => finance.accountId)
  finances!: Finance[];
}
