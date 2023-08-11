import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  colour!: string;

  @Column()
  priority!: Number;

  @Column()
  code!: string;

  @Column()
  enabled!: Number;

  @ManyToOne(() => User, user => user.projects)
  user!: User;
}
