import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
