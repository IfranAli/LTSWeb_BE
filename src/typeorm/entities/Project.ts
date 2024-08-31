import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Task } from "./Task";

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

  @OneToMany(() => Task, task => task.project)
  tasks!: Task[];
}
