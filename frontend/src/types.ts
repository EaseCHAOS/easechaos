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

export interface ExamData {
  start: string;
  end: string;
  value: string;
  class: string;
  location: string;
  invigilator: string | null;
}

export interface DayData {
  day: string;
  data: ExamData[];
}

export interface TimetableData {
  data: DayData[];
  version: string;
}
