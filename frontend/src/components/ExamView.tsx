import { useState } from "react";
import {
  format,
  isToday,
  isThisWeek,
  isAfter,
  isBefore,
  addWeeks,
  subWeeks,
} from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { ExamData, DayData, TimetableData } from "../types";

interface ExamViewProps {
  timetableData: TimetableData;
  className?: string;
}

// Normalize the data to group by day and subject
const normalizeData = (data: DayData[]) => {
  const normalizedData: Record<string, Record<string, ExamData[]>> = {};

  data.forEach((dayItem) => {
    const day = dayItem.day;
    const examData = dayItem.data[0];

    if (!normalizedData[day]) {
      normalizedData[day] = {};
    }

    if (!normalizedData[day][examData.value]) {
      normalizedData[day][examData.value] = [];
    }

    normalizedData[day][examData.value].push(examData);
  });

  return normalizedData;
};

// Convert date string to Date object
const parseDate = (dateStr: string) => {
  const [dayName, dayNum, month, year] = dateStr.split(/,\s+|th\s+|\s+/);
  const monthMap: Record<string, number> = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  return new Date(parseInt(year), monthMap[month], parseInt(dayNum));
};

export default function ExamView({ timetableData, className }: ExamViewProps) {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>("today");

  const normalizedData = normalizeData(timetableData.data);

  const classes = Array.from(
    new Set(
      timetableData.data.flatMap((day) => day.data.map((exam) => exam.class)),
    ),
  ).sort();

  const filterByClass = (exams: ExamData[]) => {
    if (selectedClass === "all") return exams;
    return exams.filter((exam) => exam.class === selectedClass);
  };

  const getTodayExams = () => {
    const result: {
      day: string;
      subjects: { name: string; exams: ExamData[] }[];
    }[] = [];

    Object.entries(normalizedData).forEach(([day, subjects]) => {
      const date = parseDate(day);

      if (isToday(date)) {
        const subjectList = Object.entries(subjects)
          .map(([name, exams]) => ({
            name,
            exams: filterByClass(exams),
          }))
          .filter((subject) => subject.exams.length > 0);

        if (subjectList.length > 0) {
          result.push({ day, subjects: subjectList });
        }
      }
    });

    return result;
  };

  const getThisWeekExams = () => {
    const result: {
      day: string;
      subjects: { name: string; exams: ExamData[] }[];
    }[] = [];

    Object.entries(normalizedData).forEach(([day, subjects]) => {
      const date = parseDate(day);

      if (isThisWeek(date) && !isToday(date)) {
        const subjectList = Object.entries(subjects)
          .map(([name, exams]) => ({
            name,
            exams: filterByClass(exams),
          }))
          .filter((subject) => subject.exams.length > 0);

        if (subjectList.length > 0) {
          result.push({ day, subjects: subjectList });
        }
      }
    });

    return result;
  };

  // Get exams for next week
  const getNextWeekExams = () => {
    const result: {
      day: string;
      subjects: { name: string; exams: ExamData[] }[];
    }[] = [];
    const nextWeekStart = addWeeks(currentDate, 1);

    Object.entries(normalizedData).forEach(([day, subjects]) => {
      const date = parseDate(day);

      if (
        isAfter(date, nextWeekStart) &&
        isBefore(date, addWeeks(nextWeekStart, 1))
      ) {
        const subjectList = Object.entries(subjects)
          .map(([name, exams]) => ({
            name,
            exams: filterByClass(exams),
          }))
          .filter((subject) => subject.exams.length > 0);

        if (subjectList.length > 0) {
          result.push({ day, subjects: subjectList });
        }
      }
    });

    return result;
  };

  // Get exams for last week
  const getLastWeekExams = () => {
    const result: {
      day: string;
      subjects: { name: string; exams: ExamData[] }[];
    }[] = [];
    const lastWeekStart = subWeeks(currentDate, 1);

    Object.entries(normalizedData).forEach(([day, subjects]) => {
      const date = parseDate(day);

      if (isAfter(date, lastWeekStart) && isBefore(date, currentDate)) {
        const subjectList = Object.entries(subjects)
          .map(([name, exams]) => ({
            name,
            exams: filterByClass(exams),
          }))
          .filter((subject) => subject.exams.length > 0);

        if (subjectList.length > 0) {
          result.push({ day, subjects: subjectList });
        }
      }
    });

    return result;
  };

  // Render exam cards
  const renderExamCards = (
    exams: { day: string; subjects: { name: string; exams: ExamData[] }[] }[],
  ) => {
    if (exams.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-medium mb-2 dark:text-[#F0F6FC]">
            No exams scheduled
          </h3>
          <p className="text-[#71717A] dark:text-[#D4D4D8]">
            Enjoy your free time!
          </p>
        </div>
      );
    }

    return exams.map((dayExams, dayIndex) => (
      <div key={dayIndex} className="mb-8">
        <h3 className="text-lg font-medium mb-4 flex items-center dark:text-[#F0F6FC]">
          <Calendar className="mr-2 h-5 w-5" />
          {dayExams.day}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dayExams.subjects.map((subject, subjectIndex) => (
            <div
              key={subjectIndex}
              className="text-card-foreground shadow-sm relative overflow-hidden rounded-xl border bg-white dark:bg-[#09090B] dark:border-[#303030]"
            >
              <div className="p-4">
                <div className="mb-3">
                  <h4 className="text-lg font-medium mb-1 dark:text-[#F0F6FC]">
                    {subject.name}
                  </h4>
                  <div className="flex items-center text-sm text-[#71717A] dark:text-[#D4D4D8]">
                    <Clock className="mr-1 h-4 w-4" />
                    {subject.exams[0].start} - {subject.exams[0].end}
                  </div>
                </div>
                <div className="space-y-2">
                  {subject.exams.map((exam, examIndex) => (
                    <div
                      key={examIndex}
                      className="flex flex-col space-y-1 text-sm"
                    >
                      <div className="flex items-center text-[#71717A] dark:text-[#D4D4D8]">
                        <Users className="mr-2 h-4 w-4" />
                        <span>{exam.class}</span>
                      </div>
                      <div className="flex items-center text-[#71717A] dark:text-[#D4D4D8]">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>{exam.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  // Get counts for badge display
  const todayCount = getTodayExams().reduce(
    (acc, day) =>
      acc +
      day.subjects.reduce(
        (subAcc, subject) => subAcc + subject.exams.length,
        0,
      ),
    0,
  );

  const thisWeekCount = getThisWeekExams().reduce(
    (acc, day) =>
      acc +
      day.subjects.reduce(
        (subAcc, subject) => subAcc + subject.exams.length,
        0,
      ),
    0,
  );

  const nextWeekCount = getNextWeekExams().reduce(
    (acc, day) =>
      acc +
      day.subjects.reduce(
        (subAcc, subject) => subAcc + subject.exams.length,
        0,
      ),
    0,
  );

  const lastWeekCount = getLastWeekExams().reduce(
    (acc, day) =>
      acc +
      day.subjects.reduce(
        (subAcc, subject) => subAcc + subject.exams.length,
        0,
      ),
    0,
  );

  return (
    <div
      className={clsx(
        "bg-white dark:bg-[#262626] rounded-lg shadow-lg flex flex-col",
        className,
      )}
    >
      <div className="p-4 border-b dark:border-[#303030] sticky top-0 bg-white dark:bg-[#262626] z-50 rounded-t-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold dark:text-[#F0F6FC]">
              Exam Timetable
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <ChevronLeft
                className="h-5 w-5 cursor-pointer hover:text-primary dark:text-[#B2B2B2] dark:hover:text-white"
                onClick={() =>
                  setCurrentDate(
                    (prev) =>
                      new Date(
                        prev.getFullYear(),
                        prev.getMonth(),
                        prev.getDate() - 7,
                      ),
                  )
                }
              />
              <span className="font-medium dark:text-[#F0F6FC]">
                {format(currentDate, "MMMM d, yyyy")}
              </span>
              <ChevronRight
                className="h-5 w-5 cursor-pointer hover:text-primary dark:text-[#B2B2B2] dark:hover:text-white"
                onClick={() =>
                  setCurrentDate(
                    (prev) =>
                      new Date(
                        prev.getFullYear(),
                        prev.getMonth(),
                        prev.getDate() + 7,
                      ),
                  )
                }
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-[#F4F4F5] dark:bg-[#262626] p-2 border border-gray-300 dark:border-[#303030] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-[#D4D4D8]"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex space-x-1 bg-[#F4F4F5] dark:bg-[#303030] p-1 rounded-md mb-6">
          <button
            onClick={() => setActiveTab("today")}
            className={clsx(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium relative",
              activeTab === "today"
                ? "bg-white dark:bg-[#262626] shadow-sm text-black dark:text-[#F0F6FC]"
                : "text-[#71717A] dark:text-[#D4D4D8] hover:bg-gray-200 dark:hover:bg-[#3e3e3e]",
            )}
          >
            Today
            {todayCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[#52525B] text-white">
                {todayCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("this-week")}
            className={clsx(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium relative",
              activeTab === "this-week"
                ? "bg-white dark:bg-[#262626] shadow-sm text-black dark:text-[#F0F6FC]"
                : "text-[#71717A] dark:text-[#D4D4D8] hover:bg-gray-200 dark:hover:bg-[#3e3e3e]",
            )}
          >
            This Week
            {thisWeekCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[#52525B] text-white">
                {thisWeekCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("next-week")}
            className={clsx(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium relative",
              activeTab === "next-week"
                ? "bg-white dark:bg-[#262626] shadow-sm text-black dark:text-[#F0F6FC]"
                : "text-[#71717A] dark:text-[#D4D4D8] hover:bg-gray-200 dark:hover:bg-[#3e3e3e]",
            )}
          >
            Next Week
            {nextWeekCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[#52525B] text-white">
                {nextWeekCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("last-week")}
            className={clsx(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium relative",
              activeTab === "last-week"
                ? "bg-white dark:bg-[#262626] shadow-sm text-black dark:text-[#F0F6FC]"
                : "text-[#71717A] dark:text-[#D4D4D8] hover:bg-gray-200 dark:hover:bg-[#3e3e3e]",
            )}
          >
            Last Week
            {lastWeekCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-[#52525B] text-white">
                {lastWeekCount}
              </span>
            )}
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "today" && renderExamCards(getTodayExams())}
          {activeTab === "this-week" && renderExamCards(getThisWeekExams())}
          {activeTab === "next-week" && renderExamCards(getNextWeekExams())}
          {activeTab === "last-week" && renderExamCards(getLastWeekExams())}
        </div>
      </div>
    </div>
  );
}
