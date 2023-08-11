import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  ManyToOne,
} from "typeorm";
import { Project } from "./Project";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  content!: string;

  @Column()
  state!: number;

  @Column()
  projectId!: number;

  @Column()
  priority!: number;

  @ManyToOne(() => Project, (project) => project.id)
  project!: Project;
}
