import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Account } from "./Account";

@Entity()
export class Finance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  accountId!: number;

  @Column()
  name!: string;

  @Column()
  date!: Date;

  @Column()
  amount!: number;

  @Column()
  categoryType!: number;

  @ManyToOne(() => Account, (account) => account.id)
  account!: Account;
}
