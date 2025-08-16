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

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
  })
  date!: Date;

  @Column({
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
    type: "decimal",
    precision: 10,
    scale: 2,
  })
  amount!: number;

  @Column()
  categoryType!: number;

  @ManyToOne(() => Account, (account) => account.id)
  account!: Account;
}
