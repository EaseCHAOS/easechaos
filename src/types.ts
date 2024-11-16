export interface TimeSlot {
  start: string;
  end: string;
  value: string | null;
}

export interface DaySchedule {
  day: string;
  data: TimeSlot[];
}

export type WeekSchedule = DaySchedule[];