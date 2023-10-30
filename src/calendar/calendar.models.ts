
export type CalendarEventViewModel = {
  id: number;
  title: string;
  date?: string;
  time?: string;
};

export type CalendarEventCreate = Omit<CalendarEventViewModel, "id">;
