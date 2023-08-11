import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column() 
  name!: string;

  @Column()
  taskId!: number;

  @Column()
  duration!: number;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column()
  repeatPattern!: number;
}