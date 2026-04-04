import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutGrid,
  type LucideIcon,
  MapPin,
  NotebookTabs,
  Rows3,
  UserRound,
  Users,
} from "lucide-react";
import { ExamData, DayData, TimetableData } from "../types";
import {
  downloadEventsAsICS,
  downloadElementAsImage,
  downloadElementAsPDF,
} from "../utils/downloadUtils";
import easeChaosLogo from "../../assets/easechaos.png";

interface ExamViewProps {
  timetableData: TimetableData;
  className?: string;
  exportLabel?: string;
}

type ExamWindow = "today" | "this-week" | "next-week" | "all";
type AllExamsView = "month" | "agenda";

interface SubjectGroup {
  name: string;
  start: string;
  end: string;
  exams: ExamData[];
}

interface DayGroup {
  day: string;
  date: Date;
  subjects: SubjectGroup[];
  totalExams: number;
}

const examWindows: {
  id: ExamWindow;
  shortLabel: string;
}[] = [
    {
      id: "all",
      shortLabel: "All Exams",
    },
    {
      id: "today",
      shortLabel: "Today",
    },
    {
      id: "this-week",
      shortLabel: "This Week",
    },
    {
      id: "next-week",
      shortLabel: "Next Week",
    },
  ];

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const panelClasses =
  "border border-[#E4E4E7] bg-white dark:border-[#303030] dark:bg-[#262626]";
const subtleSurfaceClasses = "bg-[#FAFAFA] dark:bg-[#303030]";
const primaryTextClasses = "text-[#111827] dark:text-[#F0F6FC]";
const mutedTextClasses = "text-[#71717A] dark:text-[#B2B2B2]";
const accentSoftClasses =
  "bg-blue-50 text-blue-700 dark:bg-[#1E3A5F] dark:text-[#BFDBFE]";
const accentStrongClasses =
  "bg-[#2457A7] text-white dark:bg-[#4593F8] dark:text-[#02040A]";

function parseExamDate(dateLabel: string): Date {
  const cleanedLabel = dateLabel.replace(
    /(\d+)(st|nd|rd|th)/g,
    (_, dayNumber) => dayNumber,
  );

  return new Date(cleanedLabel);
}

function countGroupedPapers(days: DayGroup[]): number {
  return days.reduce((total, day) => total + day.subjects.length, 0);
}

function formatPaperCount(count: number): string {
  return `${count} paper${count === 1 ? "" : "s"}`;
}

function formatClassCount(count: number): string {
  return `${count} class${count === 1 ? "" : "es"}`;
}

function formatClassList(exams: ExamData[]): string {
  return exams.map((exam) => exam.class).join(", ");
}

function getUniqueLocations(exams: ExamData[]): string[] {
  return Array.from(
    new Set(
      exams
        .map((exam) => exam.location)
        .filter((location): location is string => Boolean(location)),
    ),
  );
}

function formatExamWindowLabel(window: ExamWindow): string {
  switch (window) {
    case "today":
      return "today";
    case "this-week":
      return "the rest of this week";
    case "next-week":
      return "next week";
    case "all":
      return "the full exam period";
  }
}

function getWindowDescription(activeWindow: ExamWindow): string {
  switch (activeWindow) {
    case "today":
      return "Only papers scheduled for today.";
    case "this-week":
      return "Papers still coming later this week.";
    case "next-week":
      return "The next calendar week of exams.";
    case "all":
      return "The full exam period on one calendar.";
  }
}

function getDateKey(date: Date) {
  return format(startOfDay(date), "yyyy-MM-dd");
}

function parseTimeToDate(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const nextDate = new Date(date);
  nextDate.setHours(hours, minutes, 0, 0);
  return nextDate;
}

function createSubjectGroup(exam: ExamData): SubjectGroup {
  return {
    name: exam.value,
    start: exam.start,
    end: exam.end,
    exams: [exam],
  };
}

function organizeExamsByDayAndSubject(data: DayData[]): DayGroup[] {
  const groupedDays = new Map<string, DayGroup>();

  data.forEach((dayEntry) => {
    const date = startOfDay(parseExamDate(dayEntry.day));
    const existingDay = groupedDays.get(dayEntry.day);

    if (!existingDay) {
      groupedDays.set(dayEntry.day, {
        day: dayEntry.day,
        date,
        subjects: [],
        totalExams: 0,
      });
    }

    const currentDay = groupedDays.get(dayEntry.day)!;
    const subjectsByName = new Map(
      currentDay.subjects.map((subject) => [subject.name, subject]),
    );

    dayEntry.data.forEach((exam) => {
      const existingSubject = subjectsByName.get(exam.value);

      if (!existingSubject) {
        const subjectGroup = createSubjectGroup(exam);
        currentDay.subjects.push(subjectGroup);
        subjectsByName.set(exam.value, subjectGroup);
      } else {
        existingSubject.exams.push(exam);
      }

      currentDay.totalExams += 1;
    });
  });

  return Array.from(groupedDays.values())
    .map((day) => ({
      ...day,
      subjects: day.subjects.sort((left, right) =>
        left.start.localeCompare(right.start),
      ),
    }))
    .filter((day) => day.totalExams > 0)
    .sort((left, right) => left.date.getTime() - right.date.getTime());
}

function buildMonthDays(activeMonth: Date): Date[] {
  const monthStart = startOfMonth(activeMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(endOfMonth(activeMonth), {
    weekStartsOn: 0,
  });
  const monthDays: Date[] = [];

  for (
    let date = calendarStart;
    !isAfter(date, calendarEnd);
    date = addDays(date, 1)
  ) {
    monthDays.push(date);
  }

  return monthDays;
}

function buildExamCalendarEvents(days: DayGroup[]) {
  return days.flatMap((day) =>
    day.subjects.map((subject) => {
      const locations = getUniqueLocations(subject.exams);
      const invigilators = Array.from(
        new Set(
          subject.exams
            .map((exam) => exam.invigilator)
            .filter((invigilator): invigilator is string =>
              Boolean(invigilator),
            ),
        ),
      );

      return {
        start: parseTimeToDate(day.date, subject.start),
        end: parseTimeToDate(day.date, subject.end),
        summary: subject.name,
        location: locations.join(", "),
        description: [
          `Classes: ${formatClassList(subject.exams)}`,
          locations.length ? `Venue: ${locations.join(", ")}` : null,
          invigilators.length
            ? `Invigilator${invigilators.length === 1 ? "" : "s"}: ${invigilators.join(", ")}`
            : null,
          "Exported from EaseCHAOS",
        ]
          .filter(Boolean)
          .join("\n"),
      };
    }),
  );
}

interface WindowTabButtonProps {
  count: number;
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function WindowTabButton({
  count,
  isActive,
  label,
  onClick,
}: WindowTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors sm:w-auto sm:justify-start sm:gap-3",
        isActive
          ? "border-[#D4D4D8] bg-white text-[#111827] shadow-sm dark:border-[#303030] dark:bg-[#262626] dark:text-[#F0F6FC]"
          : "border-[#E4E4E7] bg-[#FAFAFA] text-[#71717A] hover:bg-white dark:border-[#303030] dark:bg-[#303030] dark:text-[#B2B2B2] dark:hover:bg-[#3A3A3A]",
      )}
    >
      <span className="truncate">{label}</span>
      <span
        className={clsx(
          "inline-flex min-w-7 items-center justify-center rounded-sm px-2 py-0.5 text-xs font-semibold",
          isActive
            ? "bg-[#F4F4F5] text-[#111827] dark:bg-[#303030] dark:text-[#F0F6FC]"
            : "bg-white text-[#52525B] dark:bg-[#262626] dark:text-[#B2B2B2]",
        )}
      >
        {count}
      </span>
    </button>
  );
}

interface ViewModeButtonProps {
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function ViewModeButton({
  icon: Icon,
  isActive,
  label,
  onClick,
}: ViewModeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-white text-[#111827] shadow-sm dark:bg-[#262626] dark:text-[#F0F6FC]"
          : "text-[#71717A] dark:text-[#B2B2B2]",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

interface ExamClassRowProps {
  exam: ExamData;
}

function ExamClassRow({ exam }: ExamClassRowProps) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
        panelClasses,
        subtleSurfaceClasses,
      )}
    >
      <div
        className={clsx(
          "inline-flex items-center gap-2 text-sm font-medium",
          primaryTextClasses,
        )}
      >
        <Users className={clsx("h-4 w-4", mutedTextClasses)} />
        {exam.class}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div
          className={clsx(
            "inline-flex items-center gap-2 text-sm",
            mutedTextClasses,
          )}
        >
          <MapPin className="h-4 w-4" />
          {exam.location}
        </div>

        {exam.invigilator ? (
          <div
            className={clsx(
              "inline-flex items-center gap-2 text-sm",
              mutedTextClasses,
            )}
          >
            <UserRound className="h-4 w-4" />
            {exam.invigilator}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface SubjectMetaProps {
  classCount: number;
  end: string;
  start: string;
}

function SubjectMeta({ classCount, end, start }: SubjectMetaProps) {
  return (
    <div
      className={clsx(
        "flex flex-wrap gap-4 text-sm font-medium",
        mutedTextClasses,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Clock3 className="h-4 w-4" />
        <span>
          {start} - {end}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Users className="h-4 w-4" />
        <span>{formatClassCount(classCount)}</span>
      </div>
    </div>
  );
}

interface AgendaPaperCardProps {
  subject: SubjectGroup;
}

function AgendaPaperCard({ subject }: AgendaPaperCardProps) {
  const locations = getUniqueLocations(subject.exams);
  const primaryLocation = locations[0];
  const secondaryLocationCount = Math.max(locations.length - 3, 0);

  return (
    <article className={clsx("overflow-hidden rounded-xl", panelClasses)}>
      <div className="flex flex-col gap-5 px-5 py-5 lg:grid lg:grid-cols-[minmax(0,1fr)_11rem] lg:items-center lg:px-6">
        <div className="min-w-0">
          <h4
            className={clsx(
              "text-xl font-semibold leading-tight",
              primaryTextClasses,
            )}
          >
            {subject.name}
          </h4>

          <div
            className={clsx(
              "mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm",
              mutedTextClasses,
            )}
          >
            <div className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              <span>
                {subject.start} - {subject.end}
              </span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {formatClassCount(subject.exams.length)} (
                {formatClassList(subject.exams)})
              </span>
            </div>
            {primaryLocation ? (
              <div className="inline-flex items-center gap-2 lg:hidden">
                <MapPin className="h-4 w-4" />
                <span>{locations.join(", ")}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#E4E4E7] pt-4 dark:border-[#303030] lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="flex mb-2 gap-1.5 justify-center">
            {locations.slice(0, 3).map((location) => (
              <span
                key={location}
                className={clsx(
                  "flex h-12 w-12 items-center justify-center rounded-[0.75rem] text-[12px] font-semibold",
                  accentSoftClasses,
                )}
              >
                {location}
              </span>
            ))}
            {secondaryLocationCount > 0 ? (
              <span
                className={clsx(
                  "flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11px] font-semibold",
                  subtleSurfaceClasses,
                  mutedTextClasses,
                )}
              >
                +{secondaryLocationCount}
              </span>
            ) : null}
          </div>

          <div className="mt-3 text-center sm:text-center lg:text-right">
            <p
              className={clsx(
                "text-xs font-semibold uppercase tracking-[0.12em]",
                mutedTextClasses,
              )}
            >
              Venue
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ExamView({
  timetableData,
  className,
  exportLabel = "EaseCHAOS Exam Schedule",
}: ExamViewProps) {
  const today = startOfToday();
  const selectedDayDetailsRef = useRef<HTMLElement | null>(null);
  const shouldScrollToDetailsRef = useRef(false);
  const downloadDropdownRef = useRef<HTMLDivElement | null>(null);
  const [activeWindow, setActiveWindow] = useState<ExamWindow>("all");
  const [allExamsView, setAllExamsView] = useState<AllExamsView>("month");
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const allExamDays = organizeExamsByDayAndSubject(timetableData.data);

  const startCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
  const endCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
  const startNextWeek = addWeeks(startCurrentWeek, 1);
  const endNextWeek = endOfWeek(startNextWeek, { weekStartsOn: 1 });

  const todayExams = allExamDays.filter((day) => isSameDay(day.date, today));
  const thisWeekExams = allExamDays.filter(
    (day) => isAfter(day.date, today) && !isAfter(day.date, endCurrentWeek),
  );
  const nextWeekExams = allExamDays.filter(
    (day) =>
      (isSameDay(day.date, startNextWeek) ||
        isAfter(day.date, startNextWeek)) &&
      (isSameDay(day.date, endNextWeek) || isBefore(day.date, endNextWeek)),
  );

  const examGroupsByWindow: Record<ExamWindow, DayGroup[]> = {
    today: todayExams,
    "this-week": thisWeekExams,
    "next-week": nextWeekExams,
    all: allExamDays,
  };

  const firstUpcomingExam =
    allExamDays.find(
      (day) => isSameDay(day.date, today) || isAfter(day.date, today),
    ) ?? allExamDays[0];
  const firstExamDate = allExamDays[0]?.date;
  const lastExamDate = allExamDays[allExamDays.length - 1]?.date;
  const firstExamMonth = firstExamDate ? startOfMonth(firstExamDate) : today;
  const lastExamMonth = lastExamDate ? startOfMonth(lastExamDate) : today;
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    Date | undefined
  >(firstUpcomingExam?.date ?? firstExamDate ?? today);
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(
    firstUpcomingExam?.date ?? firstExamDate ?? today,
  );

  const examDayLookup = useMemo(
    () =>
      new Map(allExamDays.map((day) => [getDateKey(day.date), day] as const)),
    [allExamDays],
  );
  const calendarExportEvents = useMemo(
    () => buildExamCalendarEvents(allExamDays),
    [allExamDays],
  );

  const selectedCalendarDay = selectedCalendarDate
    ? examDayLookup.get(getDateKey(selectedCalendarDate))
    : undefined;

  useEffect(() => {
    if (!shouldScrollToDetailsRef.current || !selectedCalendarDay) {
      return;
    }

    shouldScrollToDetailsRef.current = false;

    const timer = window.setTimeout(() => {
      selectedDayDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [selectedCalendarDay]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        downloadDropdownRef.current &&
        !downloadDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDownloadDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderEmptyState = () => {
    const upcomingLabel = firstUpcomingExam
      ? `Next scheduled paper is ${firstUpcomingExam.day}.`
      : "No exam entries are available in the current file.";

    return (
      <div className="rounded-lg border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-6 py-12 text-center dark:border-[#303030] dark:bg-[#262626]">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#F4F4F5] text-[#2457A7] dark:bg-[#303030] dark:text-[#4593F8]">
          <NotebookTabs className="h-5 w-5" />
        </div>
        <h3
          className={clsx(
            "text-xl font-semibold tracking-tight",
            primaryTextClasses,
          )}
        >
          No exams scheduled for {formatExamWindowLabel(activeWindow)}
        </h3>
        <p
          className={clsx(
            "mx-auto mt-3 max-w-xl text-sm leading-6",
            mutedTextClasses,
          )}
        >
          {upcomingLabel}
        </p>
      </div>
    );
  };

  const renderExamCards = (days: DayGroup[]) => {
    if (days.length === 0) {
      return renderEmptyState();
    }

    return days.map((day) => (
      <section
        key={day.day}
        className={clsx("overflow-hidden rounded-lg", panelClasses)}
      >
        <div
          className={clsx(
            "flex flex-col gap-1 border-b px-4 py-3 sm:flex-row sm:items-end sm:justify-between",
            subtleSurfaceClasses,
            "border-[#E4E4E7] dark:border-[#303030]",
          )}
        >
          <h3 className={clsx("text-base font-semibold", primaryTextClasses)}>
            {day.day}
          </h3>
          <p className={clsx("text-sm", mutedTextClasses)}>
            {day.totalExams} exam {day.totalExams === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div className="divide-y divide-[#E4E4E7] dark:divide-[#303030]">
          {day.subjects.map((subject) => (
            <article
              key={`${day.day}-${subject.name}`}
              className="bg-white dark:bg-[#262626]"
            >
              <div className="space-y-3 px-4 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4
                      className={clsx(
                        "text-base font-semibold leading-tight",
                        primaryTextClasses,
                      )}
                    >
                      {subject.name}
                    </h4>
                    <div className="mt-2">
                      <SubjectMeta
                        classCount={subject.exams.length}
                        end={subject.end}
                        start={subject.start}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {subject.exams.map((exam) => (
                    <ExamClassRow
                      key={`${day.day}-${subject.name}-${exam.class}-${exam.location}`}
                      exam={exam}
                    />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    ));
  };

  const renderSubjectClassRows = (subject: SubjectGroup, dayKey: string) => (
    <div className="mt-3 space-y-2">
      {subject.exams.map((exam) => (
        <ExamClassRow
          key={`${dayKey}-${subject.name}-${exam.class}-${exam.location}`}
          exam={exam}
        />
      ))}
    </div>
  );

  const renderSelectedDayDetails = () => (
    <section
      ref={selectedDayDetailsRef}
      className={clsx(
        "overflow-hidden rounded-lg scroll-mt-24 sm:scroll-mt-28",
        panelClasses,
      )}
    >
      <div className="border-b border-[#E4E4E7] px-3 py-4 dark:border-[#303030] sm:px-4 lg:px-5">
        <p
          className={clsx(
            "text-xs font-semibold uppercase tracking-[0.18em]",
            mutedTextClasses,
          )}
        >
          Selected Date
        </p>
        <h3 className={clsx("mt-2 text-lg font-semibold", primaryTextClasses)}>
          {selectedCalendarDate
            ? format(selectedCalendarDate, "EEEE, MMMM d")
            : "No exam date selected"}
        </h3>
        <p className={clsx("mt-2 text-sm", mutedTextClasses)}>
          {selectedCalendarDay
            ? `${formatPaperCount(selectedCalendarDay.totalExams)} scheduled`
            : "Pick a date with papers to see its details."}
        </p>
      </div>

      <div className="divide-y divide-[#E4E4E7] dark:divide-[#303030]">
        {selectedCalendarDay ? (
          selectedCalendarDay.subjects.map((subject) => (
            <article
              key={`${selectedCalendarDay.day}-${subject.name}`}
              className="px-3 py-4 sm:px-4 lg:px-5"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div className="flex-1">
                  <h3
                    className={clsx(
                      "mb-2 text-2xl font-bold leading-tight",
                      primaryTextClasses,
                    )}
                  >
                    {subject.name}
                  </h3>

                  <SubjectMeta
                    classCount={subject.exams.length}
                    end={subject.end}
                    start={subject.start}
                  />
                </div>
              </div>

              {renderSubjectClassRows(subject, selectedCalendarDay.day)}
            </article>
          ))
        ) : (
          <div
            className={clsx(
              "px-3 py-6 text-sm sm:px-4 lg:px-5",
              mutedTextClasses,
            )}
          >
            No papers are scheduled for the selected date.
          </div>
        )}
      </div>
    </section>
  );

  const renderAllExamsWorkspace = () => {
    if (allExamDays.length === 0) {
      return renderEmptyState();
    }

    let activeMonth = calendarMonth ?? firstExamMonth;
    const normalizedActiveMonth = startOfMonth(activeMonth);

    if (isBefore(normalizedActiveMonth, firstExamMonth)) {
      activeMonth = firstExamMonth;
    } else if (isAfter(normalizedActiveMonth, lastExamMonth)) {
      activeMonth = lastExamMonth;
    }

    const monthStart = startOfMonth(activeMonth);
    const canGoPrevMonth = isAfter(monthStart, firstExamMonth);
    const canGoNextMonth = isBefore(monthStart, lastExamMonth);
    const monthDays = buildMonthDays(activeMonth);

    return (
      <div className="space-y-5">
        <section
          className={clsx("min-w-0 overflow-hidden rounded-lg", panelClasses)}
        >
          <div className="border-b border-[#E4E4E7] px-3 py-4 dark:border-[#303030] sm:px-4 lg:px-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <h3
                  className={clsx(
                    "text-xl font-semibold tracking-tight",
                    primaryTextClasses,
                  )}
                >
                  {format(activeMonth, "MMM yyyy")}
                </h3>
                <button
                  onClick={() => {
                    if (canGoPrevMonth) {
                      setCalendarMonth(subMonths(activeMonth, 1));
                    }
                  }}
                  disabled={!canGoPrevMonth}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E4E4E7] bg-white text-[#4B5563] hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#303030] dark:bg-[#262626] dark:text-[#B2B2B2] dark:hover:bg-[#303030]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (canGoNextMonth) {
                      setCalendarMonth(addMonths(activeMonth, 1));
                    }
                  }}
                  disabled={!canGoNextMonth}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E4E4E7] bg-white text-[#4B5563] hover:bg-[#F4F4F5] disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#303030] dark:bg-[#262626] dark:text-[#B2B2B2] dark:hover:bg-[#303030]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <button
                  onClick={() => {
                    const jumpDate =
                      firstUpcomingExam?.date ?? firstExamDate ?? today;
                    setCalendarMonth(jumpDate);
                    setSelectedCalendarDate(jumpDate);
                    setAllExamsView("month");
                  }}
                  className="rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-medium text-[#111827] hover:bg-[#F4F4F5] dark:border-[#303030] dark:bg-[#262626] dark:text-[#F0F6FC] dark:hover:bg-[#303030]"
                >
                  {firstUpcomingExam ? "Next Paper" : "First Exam"}
                </button>

                <div className="inline-flex rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-1 dark:border-[#303030] dark:bg-[#303030]">
                  <ViewModeButton
                    icon={LayoutGrid}
                    isActive={allExamsView === "month"}
                    label="Month"
                    onClick={() => setAllExamsView("month")}
                  />
                  <ViewModeButton
                    icon={Rows3}
                    isActive={allExamsView === "agenda"}
                    label="Agenda"
                    onClick={() => setAllExamsView("agenda")}
                  />
                </div>

                {allExamsView === "agenda" ? (
                  <div ref={downloadDropdownRef} className="relative">
                    <div
                      className="flex items-center gap-2"
                      onClick={() =>
                        setShowDownloadDropdown((currentState) => !currentState)
                      }
                    >
                      <span
                        className={clsx(
                          "text-sm font-medium",
                          mutedTextClasses,
                        )}
                      >
                        Download
                      </span>
                      <button className="flex items-center rounded-full border-2 border-gray-600 p-1 dark:border-[#B2B2B2] dark:text-[#B2B2B2]">
                        <svg
                          className="w-2 h-2"
                          data-slot="icon"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                          ></path>
                        </svg>
                      </button>
                    </div>

                    {showDownloadDropdown ? (
                      <div className="absolute right-0 top-full z-[9999] mt-2 rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-[#303030] dark:bg-[#262626]">
                        <button
                          onClick={() => {
                            downloadElementAsPDF(
                              "exam-agenda-export",
                              "Exam-Agenda.pdf",
                            );
                            setShowDownloadDropdown(false);
                          }}
                          className="w-full border-b border-gray-200 px-4 py-1 text-left hover:bg-gray-100 dark:border-[#303030] dark:hover:bg-[#3e3e3e]"
                        >
                          <span className="text-sm dark:text-[#B2B2B2]">
                            PDF
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            downloadEventsAsICS(
                              calendarExportEvents,
                              "Exam-Agenda.ics",
                              exportLabel,
                            );
                            setShowDownloadDropdown(false);
                          }}
                          className="w-full border-b border-gray-200 px-4 py-1 text-left hover:bg-gray-100 dark:border-[#303030] dark:hover:bg-[#3e3e3e]"
                        >
                          <span className="text-sm dark:text-[#B2B2B2]">
                            Calendar (.ics)
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            downloadElementAsImage(
                              "exam-agenda-export",
                              "Exam-Agenda.png",
                            );
                            setShowDownloadDropdown(false);
                          }}
                          className="w-full px-4 py-1 text-left hover:bg-gray-100 dark:hover:bg-[#3e3e3e]"
                        >
                          <span className="text-sm dark:text-[#B2B2B2]">
                            Image
                          </span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {allExamsView === "month" ? (
            <>
              <div className="grid grid-cols-7 border-b border-[#E4E4E7] bg-[#FAFAFA] dark:border-[#303030] dark:bg-[#303030]">
                {weekdayLabels.map((day) => (
                  <div
                    key={day}
                    className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6D7480] dark:text-[#B2B2B2] sm:px-3 sm:py-3 sm:text-[11px] sm:tracking-[0.14em]"
                  >
                    <span className="sm:hidden">{day.charAt(0)}</span>
                    <span className="hidden sm:inline">{day}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {monthDays.map((date) => {
                  const dayGroup = examDayLookup.get(getDateKey(date));
                  const isCurrentMonth = isSameMonth(date, activeMonth);
                  const isSelected =
                    !!selectedCalendarDate &&
                    isSameDay(date, selectedCalendarDate);
                  const isTodayDate = isToday(date);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedCalendarDate(date);
                        if (!isCurrentMonth) {
                          setCalendarMonth(date);
                        }
                        shouldScrollToDetailsRef.current = !!dayGroup;
                      }}
                      className={clsx(
                        "flex min-h-[3.75rem] flex-col border-b border-r border-[#E4E4E7] px-1.5 py-1.5 text-left text-[#111827] transition-colors dark:border-[#303030] dark:text-[#F0F6FC] sm:min-h-[9rem] sm:px-3 sm:py-2",
                        isSelected
                          ? "bg-blue-50 dark:bg-[#1E3A5F]"
                          : "bg-white dark:bg-[#262626]",
                        dayGroup &&
                        !isSelected &&
                        "dark:bg-[#2B313A] dark:hover:bg-[#343B46]",
                        !isCurrentMonth &&
                        "bg-[#FAFAFA] text-[#A1A1AA] dark:bg-[#1C1C1C] dark:text-[#6F6F6F]",
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-between sm:mb-2">
                        <span
                          className={clsx(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 sm:text-sm",
                            !isTodayDate &&
                            !isSelected &&
                            "text-[#111827] dark:text-[#F0F6FC]",
                            isTodayDate && !isSelected && accentStrongClasses,
                            isSelected && accentStrongClasses,
                          )}
                        >
                          {format(date, "d")}
                        </span>
                        {dayGroup && dayGroup.subjects.length > 1 ? (
                          <span
                            className={clsx(
                              "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:text-[11px]",
                              accentSoftClasses,
                            )}
                          >
                            {dayGroup.subjects.length}
                          </span>
                        ) : null}
                      </div>

                      {dayGroup ? (
                        <>
                          <div className="mt-auto sm:hidden">
                            <div className="h-1.5 w-full rounded-full bg-[#93C5FD] dark:bg-[#4593F8]" />
                          </div>

                          <div className="hidden space-y-1.5 mt-2 sm:block">
                            {dayGroup.subjects.slice(0, 2).map((subject) => (
                              <div
                                key={`${dayGroup.day}-${subject.name}`}
                                className={clsx(
                                  "rounded-md px-2 py-1 text-left text-[11px] font-medium leading-4",
                                  accentSoftClasses,
                                )}
                              >
                                <div className="truncate">{subject.name}</div>
                                <div className="mt-0.5 truncate text-[10px] text-[#5A6B82] dark:text-[#D6E8FF]">
                                  {subject.start} - {subject.end}
                                </div>
                              </div>
                            ))}
                            {dayGroup.subjects.length > 2 ? (
                              <div
                                className={clsx(
                                  "text-[11px] font-medium",
                                  mutedTextClasses,
                                )}
                              >
                                +{dayGroup.subjects.length - 2} more
                              </div>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 sm:p-4 lg:p-5">
                {renderSelectedDayDetails()}
              </div>
            </>
          ) : (
            <div
              id="exam-agenda-export"
              className="space-y-6 rounded-lg bg-[#FAFAFA] p-3 dark:bg-[#02040A] sm:p-4 lg:p-5"
            >
              {allExamDays.map((day) => (
                <section
                  key={day.day}
                  className="grid gap-4 lg:grid-cols-[9.5rem_minmax(0,1fr)] lg:gap-6"
                >
                  <div className="px-1 pt-1">
                    <h3 className="text-lg font-semibold leading-tight text-[#2457A7] dark:text-[#4593F8]">
                      {format(day.date, "EEEE, do")}
                    </h3>
                    <p
                      className={clsx(
                        "mt-1 text-xs font-semibold uppercase tracking-[0.16em]",
                        mutedTextClasses,
                      )}
                    >
                      {format(day.date, "MMMM yyyy")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {day.subjects.map((subject) => (
                      <AgendaPaperCard
                        key={`${day.day}-${subject.name}`}
                        subject={subject}
                      />
                    ))}
                  </div>
                </section>
              ))}

              <div className="flex justify-end pt-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-white px-3 py-2 text-xs font-medium text-[#52525B] dark:border-[#303030] dark:bg-[#262626] dark:text-[#B2B2B2]">
                  <img
                    src={easeChaosLogo}
                    alt="easeCHAOS"
                    className="h-4 w-6 object-contain"
                  />
                  <span>Exported from easeCHAOS</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <div
      className={clsx(
        "min-w-0 overflow-x-hidden space-y-5 sm:space-y-6",
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-[#E4E4E7] pb-3 dark:border-[#303030] sm:pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {examWindows.map((window) => {
            const isActive = activeWindow === window.id;
            const count = countGroupedPapers(examGroupsByWindow[window.id]);

            return (
              <WindowTabButton
                key={window.id}
                count={count}
                isActive={isActive}
                label={window.shortLabel}
                onClick={() => setActiveWindow(window.id)}
              />
            );
          })}
        </div>
        <div className="hidden sm:block sm:max-w-[32rem]">
          <p className={clsx("text-sm", mutedTextClasses)}>
            {getWindowDescription(activeWindow)}
          </p>
        </div>
      </div>

      <div className="min-w-0 space-y-8">
        {activeWindow === "all"
          ? renderAllExamsWorkspace()
          : renderExamCards(examGroupsByWindow[activeWindow])}
      </div>
    </div>
  );
}
