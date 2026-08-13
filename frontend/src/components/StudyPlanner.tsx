import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  addDays,
  differenceInMinutes,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import {
  CalendarDays,
  Clock3,
  Flame,
  GraduationCap,
  Plus,
  Trash2,
} from "lucide-react";
import { ExamData, TimetableData } from "../types";
import { getCourseColor } from "../lib/courseColors";

const SESSIONS_STORAGE_KEY = "easechaos:study-sessions";
const STUDY_START_HOUR = 7;
const STUDY_END_HOUR = 21;

interface StudySession {
  id: string;
  date: string;
  subject: string;
  label: string;
  start: string;
  end: string;
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface StudyPlannerProps {
  timetableData: TimetableData;
  className?: string;
}

const panelClasses =
  "border border-[#E4E4E7] bg-white dark:border-[#303030] dark:bg-[#262626]";
const subtleSurfaceClasses = "bg-[#FAFAFA] dark:bg-[#303030]";
const primaryTextClasses = "text-[#111827] dark:text-[#F0F6FC]";
const mutedTextClasses = "text-[#71717A] dark:text-[#B2B2B2]";
const accentStrongClasses =
  "bg-[#2457A7] text-white dark:bg-[#4593F8] dark:text-[#02040A]";

function parseExamDate(dateLabel: string): Date {
  return new Date(dateLabel.replace(/(\d+)(st|nd|rd|th)/g, "$1"));
}

function parseTimeToDate(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

function getDateKey(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd");
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function mergeRanges(ranges: TimeRange[]): TimeRange[] {
  const merged: TimeRange[] = [];

  ranges.forEach((range) => {
    const last = merged[merged.length - 1];

    if (last && range.start.getTime() <= last.end.getTime()) {
      last.end =
        range.end.getTime() > last.end.getTime() ? range.end : last.end;
    } else {
      merged.push({ start: range.start, end: range.end });
    }
  });

  return merged;
}

function computeFreeSlots(date: Date, examRanges: TimeRange[]): TimeRange[] {
  const windowStart = parseTimeToDate(
    date,
    `${STUDY_START_HOUR}:00`,
  );
  const windowEnd = parseTimeToDate(date, `${STUDY_END_HOUR}:00`);
  const slots: TimeRange[] = [];
  let cursor = windowStart;

  examRanges.forEach((range) => {
    if (range.start.getTime() > cursor.getTime()) {
      slots.push({ start: cursor, end: range.start });
    }

    if (range.end.getTime() > cursor.getTime()) {
      cursor = range.end;
    }
  });

  if (windowEnd.getTime() > cursor.getTime()) {
    slots.push({ start: cursor, end: windowEnd });
  }

  return slots;
}

function loadSessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as StudySession[];
  } catch {
    return [];
  }
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function StudyPlanner({
  timetableData,
  className,
}: StudyPlannerProps) {
  const uniqueExamDays = useMemo(
    () =>
      Array.from(new Set(timetableData.data.map((day) => day.day)))
        .map(parseExamDate)
        .map(startOfDay)
        .toSorted((left, right) => left.getTime() - right.getTime()),
    [timetableData],
  );

  const examsByDayKey = useMemo(() => {
    const map = new Map<string, ExamData[]>();

    timetableData.data.forEach((day) => {
      map.set(getDateKey(parseExamDate(day.day)), day.data);
    });

    return map;
  }, [timetableData]);

  const courses = useMemo(
    () =>
      Array.from(
        new Set(
          timetableData.data.flatMap((day) =>
            day.data.map((exam) => exam.value),
          ),
        ),
      ).toSorted(),
    [timetableData],
  );

  const examDateKeys = useMemo(
    () => new Set(uniqueExamDays.map(getDateKey)),
    [uniqueExamDays],
  );

  const recommendedStudyDate = useMemo(() => {
    const tomorrow = addDays(startOfDay(new Date()), 1);

    for (let offset = 0; offset <= 30; offset += 1) {
      const candidate = addDays(tomorrow, offset);

      if (!examDateKeys.has(getDateKey(candidate))) {
        return candidate;
      }
    }

    return tomorrow;
  }, [examDateKeys]);

  const firstDay = uniqueExamDays[0];
  const lastDay = uniqueExamDays[uniqueExamDays.length - 1];

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    recommendedStudyDate,
  );
  const [sessions, setSessions] = useState<StudySession[]>(loadSessions);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("General study");
  const [label, setLabel] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const activeDate = selectedDate ?? recommendedStudyDate ?? firstDay ?? startOfDay(new Date());
  const activeKey = getDateKey(activeDate);
  const isRecommendedDay = isSameDay(activeDate, recommendedStudyDate);

  useEffect(() => {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const examRanges = useMemo(() => {
    const entries = examsByDayKey.get(activeKey) ?? [];
    const date = new Date(`${activeKey}T00:00:00`);

    return mergeRanges(
      entries
        .map((exam) => ({
          start: parseTimeToDate(date, exam.start),
          end: parseTimeToDate(date, exam.end),
        }))
        .toSorted((left, right) => left.start.getTime() - right.start.getTime()),
    );
  }, [activeKey, examsByDayKey]);

  const examEntriesForDay = useMemo(() => {
    const entries = examsByDayKey.get(activeKey) ?? [];

    return entries
      .map((exam) => ({
        subject: exam.value,
        className: exam.class,
        start: parseTimeToDate(activeDate, exam.start),
        end: parseTimeToDate(activeDate, exam.end),
      }))
      .toSorted((left, right) => left.start.getTime() - right.start.getTime());
  }, [activeKey, activeDate, examsByDayKey]);

  const freeSlots = useMemo(
    () => computeFreeSlots(activeDate, examRanges),
    [activeDate, examRanges],
  );

  const daySessions = useMemo(
    () =>
      sessions
        .filter((session) => session.date === activeKey)
        .toSorted((left, right) => left.start.localeCompare(right.start)),
    [sessions, activeKey],
  );

  const dailyStats = useMemo(() => {
    const stats = new Map<
      string,
      { freeMinutes: number; sessionCount: number; subjects: string[] }
    >();

    uniqueExamDays.forEach((date) => {
      const key = getDateKey(date);
      const entries = examsByDayKey.get(key) ?? [];
      const dateObj = new Date(`${key}T00:00:00`);

      const ranges = mergeRanges(
        entries
          .map((exam) => ({
            start: parseTimeToDate(dateObj, exam.start),
            end: parseTimeToDate(dateObj, exam.end),
          }))
          .toSorted(
            (left, right) => left.start.getTime() - right.start.getTime(),
          ),
      );

      const freeMinutes = computeFreeSlots(date, ranges).reduce(
        (total, slot) => total + differenceInMinutes(slot.end, slot.start),
        0,
      );

      stats.set(key, {
        freeMinutes,
        sessionCount: sessions.filter(
          (session) => session.date === key,
        ).length,
        subjects: Array.from(new Set(entries.map((exam) => exam.value))),
      });
    });

    return stats;
  }, [uniqueExamDays, examsByDayKey, sessions]);

  const totalFreeMinutes = Array.from(dailyStats.values()).reduce(
    (total, stat) => total + stat.freeMinutes,
    0,
  );

  if (uniqueExamDays.length === 0) {
    return (
      <div
        className={clsx(
          "rounded-lg border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-6 py-12 text-center dark:border-[#303030] dark:bg-[#262626]",
          className,
        )}
      >
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#F4F4F5] text-[#2457A7] dark:bg-[#303030] dark:text-[#4593F8]">
          <Flame className="h-5 w-5" />
        </div>
        <h3
          className={clsx(
            "text-xl font-semibold tracking-tight",
            primaryTextClasses,
          )}
        >
          No exam dates to plan around
        </h3>
        <p className={clsx("mx-auto mt-3 max-w-xl text-sm leading-6", mutedTextClasses)}>
          Load an exam timetable first so the planner knows your study window.
        </p>
      </div>
    );
  }

  const totalFreeHoursLabel = formatMinutes(totalFreeMinutes);

  const goToDay = (offset: number) => {
    if (!firstDay || !lastDay) {
      return;
    }

    const next = addDays(activeDate, offset);

    if (next.getTime() < startOfDay(firstDay).getTime() || next.getTime() > startOfDay(lastDay).getTime()) {
      return;
    }

    setSelectedDate(next);
  };

  const startSessionInSlot = (slot: TimeRange) => {
    setSubject("General study");
    setStart(format(slot.start, "HH:mm"));
    setEnd(format(slot.end, "HH:mm"));
    setFormError(null);
    setShowForm(true);
  };

  const handleAddSession = () => {
    if (!start || !end) {
      setFormError("Pick a start and end time.");
      return;
    }

    const startMinutes =
      Number(start.slice(0, 2)) * 60 + Number(start.slice(3, 5));
    const endMinutes = Number(end.slice(0, 2)) * 60 + Number(end.slice(3, 5));

    if (endMinutes <= startMinutes) {
      setFormError("End time must be after the start time.");
      return;
    }

    const overlapsExam = examRanges.some((range) => {
      const rangeStartMinutes =
        range.start.getHours() * 60 + range.start.getMinutes();
      const rangeEndMinutes =
        range.end.getHours() * 60 + range.end.getMinutes();

      return startMinutes < rangeEndMinutes && endMinutes > rangeStartMinutes;
    });

    if (overlapsExam) {
      setFormError("This time overlaps a scheduled exam.");
      return;
    }

    const session: StudySession = {
      id: generateSessionId(),
      date: activeKey,
      subject: subject.trim() || "General study",
      label: label.trim() || subject.trim() || "General study",
      start,
      end,
    };

    setSessions((current) => [...current, session]);
    setLabel("");
    setStart("");
    setEnd("");
    setFormError(null);
    setShowForm(false);
  };

  const removeSession = (id: string) => {
    setSessions((current) => current.filter((session) => session.id !== id));
  };

  const activeStats = dailyStats.get(activeKey);

  return (
    <div className={clsx("min-w-0 space-y-5", className)}>
      <section className={clsx("overflow-hidden rounded-lg", panelClasses)}>
        <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <p
              className={clsx(
                "text-[11px] font-semibold uppercase tracking-[0.16em]",
                mutedTextClasses,
              )}
            >
              Study Planner
            </p>
            <h3
              className={clsx(
                "mt-1 text-lg font-bold leading-tight",
                primaryTextClasses,
              )}
            >
              {format(firstDay, "MMM d")} – {format(lastDay, "MMM d, yyyy")}
            </h3>
            <p className={clsx("mt-1 text-sm", mutedTextClasses)}>
              Pick a day, tap the best slot, and save it in one step.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <div className="inline-flex items-center gap-2">
              <Clock3 className={clsx("h-4 w-4", mutedTextClasses)} />
              <span className={clsx("font-medium", primaryTextClasses)}>
                {totalFreeHoursLabel}
              </span>
              <span className={mutedTextClasses}>free in the period</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <CalendarDays className={clsx("h-4 w-4", mutedTextClasses)} />
              <span className={clsx("font-medium", primaryTextClasses)}>
                {sessions.length}
              </span>
              <span className={mutedTextClasses}>study sessions planned</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E4E4E7] px-4 py-4 dark:border-[#303030] sm:px-5">
          <div className="flex flex-col gap-3 rounded-lg border border-[#D6E7FF] bg-[#F5FAFF] px-4 py-4 dark:border-[#2457A7]/40 dark:bg-[#13233D] sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2457A7] dark:text-[#90B8FF]">
                Best next study day
              </p>
              <p className={clsx("mt-1 text-base font-semibold", primaryTextClasses)}>
                {format(recommendedStudyDate, "EEE, MMM d")}
              </p>
              <p className={clsx("mt-1 text-sm", mutedTextClasses)}>
                {isSameDay(recommendedStudyDate, startOfDay(new Date()))
                  ? "Today is still open for study."
                  : examDateKeys.has(getDateKey(recommendedStudyDate))
                    ? "This day has exams, but there is still time to plan around them."
                    : "A clean study day with no exams comes first."
                }
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate(recommendedStudyDate)}
              className={clsx(
                "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium",
                isRecommendedDay
                  ? "bg-[#2457A7] text-white dark:bg-[#4593F8] dark:text-[#02040A]"
                  : "border border-[#2457A7] text-[#2457A7] hover:bg-[#EEF5FF] dark:border-[#4593F8] dark:text-[#90B8FF] dark:hover:bg-[#13233D]",
              )}
            >
              <Plus className="h-4 w-4" />
              Use this day
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-[#E4E4E7] px-3 py-3 dark:border-[#303030] sm:px-4">
          <button
            type="button"
            onClick={() => setSelectedDate(recommendedStudyDate)}
            className={clsx(
              "flex min-w-20 flex-none flex-col items-center gap-1 rounded-lg border px-2.5 py-2 transition-colors",
              isRecommendedDay
                ? "border-[#2457A7] bg-[#2457A7] text-white dark:border-[#4593F8] dark:bg-[#4593F8] dark:text-[#02040A]"
                : "border-[#E4E4E7] bg-[#FAFAFA] text-[#52525B] hover:bg-white dark:border-[#303030] dark:bg-[#303030] dark:text-[#B2B2B2] dark:hover:bg-[#3A3A3A]",
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              Next
            </span>
            <span className="text-sm font-bold leading-none">
              {format(recommendedStudyDate, "d")}
            </span>
            <span className="text-[10px] font-medium">Study day</span>
          </button>
          {uniqueExamDays.map((date) => {
            const key = getDateKey(date);
            const stat = dailyStats.get(key);
            const isSelected = isSameDay(date, activeDate);
            const isTodayDate = isSameDay(date, new Date());

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={clsx(
                  "flex min-w-14 flex-none flex-col items-center gap-1 rounded-lg border px-2.5 py-2 transition-colors",
                  isSelected
                    ? "border-[#2457A7] bg-[#2457A7] text-white dark:border-[#4593F8] dark:bg-[#4593F8] dark:text-[#02040A]"
                    : "border-[#E4E4E7] bg-[#FAFAFA] text-[#52525B] hover:bg-white dark:border-[#303030] dark:bg-[#303030] dark:text-[#B2B2B2] dark:hover:bg-[#3A3A3A]",
                  isTodayDate && !isSelected && "ring-1 ring-[#2457A7] dark:ring-[#4593F8]",
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  {format(date, "EEE")}
                </span>
                <span className="text-sm font-bold leading-none">
                  {format(date, "d")}
                </span>
                <span className="flex items-center gap-1">
                  {stat?.subjects.slice(0, 3).map((subjectName) => (
                    <span
                      key={subjectName}
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected
                          ? "bg-white dark:bg-[#02040A]"
                          : getCourseColor(subjectName).strong,
                      )}
                    />
                  ))}
                </span>
                <span
                  className={clsx(
                    "text-[10px] font-medium",
                    isSelected
                      ? "text-white/80 dark:text-[#02040A]/80"
                      : mutedTextClasses,
                  )}
                >
                  {stat ? formatMinutes(stat.freeMinutes) : "0h"} free
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={clsx("overflow-hidden rounded-lg", panelClasses)}>
        <div className="flex flex-col gap-3 border-b border-[#E4E4E7] px-4 py-4 dark:border-[#303030] sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToDay(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E4E4E7] bg-white text-[#4B5563] hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#303030] dark:bg-[#262626] dark:text-[#B2B2B2] dark:hover:bg-[#303030]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <div className="min-w-0">
              <h3
                className={clsx(
                  "text-lg font-bold leading-tight",
                  primaryTextClasses,
                )}
              >
                {format(activeDate, "EEEE, MMM d")}
              </h3>
              <p className={clsx("mt-0.5 text-sm", mutedTextClasses)}>
                {activeStats
                  ? `${formatMinutes(activeStats.freeMinutes)} free · ${activeStats.sessionCount} session${activeStats.sessionCount === 1 ? "" : "s"} planned`
                  : "No exams this day"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => goToDay(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#E4E4E7] bg-white text-[#4B5563] hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#303030] dark:bg-[#262626] dark:text-[#B2B2B2] dark:hover:bg-[#303030]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setFormError(null);
            }}
            className={clsx(
              "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              showForm
                ? "bg-[#F4F4F5] text-[#52525B] dark:bg-[#303030] dark:text-[#B2B2B2]"
                : accentStrongClasses,
            )}
          >
            {showForm ? "Cancel" : (
              <>
                <Plus className="h-4 w-4" />
                Add study session
              </>
            )}
          </button>
        </div>

        {showForm ? (
          <div
            className={clsx(
              "space-y-4 border-b border-[#E4E4E7] px-4 py-4 sm:px-5",
              subtleSurfaceClasses,
              "dark:border-[#303030]",
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block min-w-0">
                <span className={clsx("mb-1 block text-xs font-semibold", mutedTextClasses)}>
                  Subject
                </span>
                <select
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#111827] dark:border-[#303030] dark:bg-[#262626] dark:text-[#F0F6FC]"
                >
                  <option value="General study">General study</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block min-w-0">
                <span className={clsx("mb-1 block text-xs font-semibold", mutedTextClasses)}>
                  Label (optional)
                </span>
                <input
                  type="text"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="e.g. Revision: past papers"
                  className="w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#A1A1AA] dark:border-[#303030] dark:bg-[#262626] dark:text-[#F0F6FC] dark:placeholder:text-[#6F6F6F]"
                />
              </label>

              <label className="block min-w-0">
                <span className={clsx("mb-1 block text-xs font-semibold", mutedTextClasses)}>
                  Start
                </span>
                <input
                  type="time"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  className="w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#111827] dark:border-[#303030] dark:bg-[#262626] dark:text-[#F0F6FC]"
                />
              </label>

              <label className="block min-w-0">
                <span className={clsx("mb-1 block text-xs font-semibold", mutedTextClasses)}>
                  End
                </span>
                <input
                  type="time"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  className="w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#111827] dark:border-[#303030] dark:bg-[#262626] dark:text-[#F0F6FC]"
                />
              </label>
            </div>

            {formError ? (
              <p className="text-sm text-red-500 dark:text-red-400">
                {formError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleAddSession}
              className={clsx(
                "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium",
                accentStrongClasses,
              )}
            >
              <Plus className="h-4 w-4" />
              Add to {format(activeDate, "EEE, MMM d")}
            </button>
          </div>
        ) : null}

        <div className="divide-y divide-[#E4E4E7] dark:divide-[#303030]">
          <div className="px-4 py-4 sm:px-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 className={clsx("text-sm font-semibold", primaryTextClasses)}>
                Free time
              </h4>
              <span className={clsx("text-xs", mutedTextClasses)}>
                Between {STUDY_START_HOUR}:00 and {STUDY_END_HOUR}:00
              </span>
            </div>

            {freeSlots.length === 0 ? (
              <p className={clsx("text-sm", mutedTextClasses)}>
                No free time today — exams fill the whole window.
              </p>
            ) : (
              <ul className="space-y-2">
                {freeSlots.slice(0, 3).map((slot) => (
                  <li
                    key={slot.start.toISOString()}
                    className="flex items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 flex-none rounded-full bg-[#10B981] dark:bg-[#34D399]" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                          {format(slot.start, "h:mm a")} –{" "}
                          {format(slot.end, "h:mm a")}
                        </p>
                        <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                          {formatMinutes(
                            differenceInMinutes(slot.end, slot.start),
                          )}{" "}
                          free
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => startSessionInSlot(slot)}
                      className="inline-flex flex-none items-center gap-1 rounded-md border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-[#262626] dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Schedule
                      </button>
                    </li>
                ))}
                {freeSlots.length > 3 ? (
                  <li className={clsx("px-1 pt-1 text-xs", mutedTextClasses)}>
                    More slots are available below. The planner shows the best ones first.
                  </li>
                ) : null}
              </ul>
            )}
          </div>

          <div className="px-4 py-4 sm:px-5">
            <h4 className={clsx("mb-3 text-sm font-semibold", primaryTextClasses)}>
              Your study sessions
            </h4>

            {daySessions.length === 0 ? (
              <p className={clsx("text-sm", mutedTextClasses)}>
                Nothing planned yet. Tap the best slot above to start.
              </p>
            ) : (
              <ul className="space-y-2">
                {daySessions.map((session) => {
                  const sessionColor = getCourseColor(session.subject);

                  return (
                    <li
                      key={session.id}
                      className={clsx(
                        "flex items-center justify-between gap-3 rounded-md border px-3 py-2.5",
                        panelClasses,
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={clsx(
                            "h-2.5 w-2.5 flex-none rounded-full",
                            session.subject === "General study"
                              ? "bg-[#52525B] dark:bg-[#B2B2B2]"
                              : sessionColor.strong,
                          )}
                        />
                        <div className="min-w-0">
                          <p
                            className={clsx(
                              "truncate text-sm font-medium",
                              primaryTextClasses,
                            )}
                          >
                            {session.label}
                          </p>
                          <p className={clsx("text-xs", mutedTextClasses)}>
                            {session.subject} · {session.start} – {session.end}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSession(session.id)}
                        aria-label={`Remove ${session.label}`}
                        className="inline-flex flex-none items-center gap-1 rounded-md border border-[#E4E4E7] bg-white px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 dark:border-[#303030] dark:bg-[#262626] dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="px-4 py-4 sm:px-5">
            <h4 className={clsx("mb-3 text-sm font-semibold", primaryTextClasses)}>
              Scheduled exams
            </h4>

            {examEntriesForDay.length === 0 ? (
              <p className={clsx("text-sm", mutedTextClasses)}>
                No exams on this day.
              </p>
            ) : (
              <ul className="space-y-2">
                {examEntriesForDay.map((examEntry) => {
                  const courseColor = getCourseColor(examEntry.subject);

                  return (
                    <li
                      key={`${examEntry.start.toISOString()}-${examEntry.className}`}
                      className={clsx(
                        "flex items-center gap-2.5 rounded-md border px-3 py-2.5",
                        panelClasses,
                      )}
                    >
                      <span
                        className={clsx(
                          "h-2.5 w-2.5 flex-none rounded-full",
                          courseColor.strong,
                        )}
                      />
                      <div className="min-w-0">
                        <p
                          className={clsx(
                            "truncate text-sm font-medium",
                            primaryTextClasses,
                          )}
                        >
                          {examEntry.subject}
                        </p>
                        <p className={clsx("text-xs", mutedTextClasses)}>
                          {examEntry.className} ·{" "}
                          {format(examEntry.start, "h:mm a")} –{" "}
                          {format(examEntry.end, "h:mm a")}
                        </p>
                      </div>
                      <span
                        className={clsx(
                          "ml-auto inline-flex flex-none items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          subtleSurfaceClasses,
                          mutedTextClasses,
                        )}
                      >
                        <GraduationCap className="h-3 w-3" />
                        Exam
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
