import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  ManyToMany,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

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
}
