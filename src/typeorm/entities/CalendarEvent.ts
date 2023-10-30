import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  title!: string;

  @Column()
  date?: Date;

  @Column()
  time?: string;

  @ManyToOne(() => User, (user) => user.calendarEvents)
  user!: User;
}
