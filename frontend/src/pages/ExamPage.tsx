import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Layers3 } from "lucide-react";
import ExamView from "../components/ExamView";
import ThemeToggle from "../components/ThemeToggle";
import { TimetableData } from "../types";
import { departments, years } from "../constants/departments";

const parseExamDate = (dateLabel: string) =>
  new Date(dateLabel.replace(/(\d+)(st|nd|rd|th)/g, "$1"));

const getGroupedPaperCount = (examData: TimetableData | null) => {
  if (!examData) return 0;

  const paperKeys = new Set(
    examData.data.flatMap((day) =>
      day.data.map((exam) => `${day.day}::${exam.value}`),
    ),
  );

  return paperKeys.size;
};

const fetchExamTimetable = async (dept: string, year: string) => {
  const timestamp = new Date().getTime();
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/get_time_table?t=${timestamp}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      body: JSON.stringify({
        filename: "Draft_1_ex",
        class_pattern: `${dept} ${year}`,
        is_exam: true,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch exam data");
  }

  return response.json() as Promise<TimetableData>;
};

export default function ExamPage() {
  const { dept, year } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examData, setExamData] = useState<TimetableData | null>(null);

  useEffect(() => {
    if (!dept || !year) {
      setError("Missing department or year");
      return;
    }

    const fetchExamData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchExamTimetable(dept, year);
        setExamData(data);
      } catch (err) {
        setError((err as Error).message || "Failed to load exam timetable");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [dept, year]);

  // Get unique classes from exam data
  const getUniqueClasses = () => {
    if (!examData) return [];

    return Array.from(
      new Set(
        examData.data.flatMap((day) => day.data.map((exam) => exam.class)),
      ),
    ).sort();
  };

  const classes = getUniqueClasses();
  const selectedDepartment = departments.find((entry) => entry.id === dept);
  const selectedYear = years.find((entry) => String(entry.id) === year);
  const totalDisplayedPapers = getGroupedPaperCount(examData);
  const uniqueExamDays = examData
    ? Array.from(new Set(examData.data.map((day) => day.day))).sort(
        (left, right) =>
          parseExamDate(left).getTime() - parseExamDate(right).getTime(),
      )
    : [];
  const firstExamDay = uniqueExamDays[0];
  const lastExamDay = uniqueExamDays[uniqueExamDays.length - 1];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] dark:bg-[#02040A]">
        <div className="rounded-lg border border-[#E4E4E7] bg-white px-8 py-10 text-center shadow-sm dark:border-[#303030] dark:bg-[#262626]">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#F4F4F5] text-[#2457A7] dark:bg-[#303030] dark:text-[#4593F8]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="text-[#71717A] dark:text-[#B2B2B2]">
            Loading exam timetable...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] dark:bg-[#02040A]">
        <div className="rounded-lg border border-red-200 bg-white px-8 py-10 text-center shadow-sm dark:border-red-900/50 dark:bg-[#262626]">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] dark:bg-[#02040A]">
        <div className="text-[#71717A] dark:text-[#B2B2B2]">
          No exam timetable found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAFAFA] dark:bg-[#02040A]">
      <div className="relative h-full w-full overflow-x-hidden px-3 py-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="z-20 border-b bg-[#FAFAFA] px-2 py-4 dark:border-[#303030] dark:bg-[#02040A] sm:sticky sm:top-0 lg:px-0">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="rounded-md border border-[#1B1B1B] p-1.5 hover:bg-gray-100 dark:border-[#303030] dark:bg-[#262626] dark:hover:bg-[#303030]"
                >
                  <ArrowLeft className="h-4 w-4 dark:text-[#B2B2B2]" />
                </button>

                <div className="min-w-0">
                  <h1 className="text-xl font-bold tracking-tight text-[#111827] dark:text-[#F0F6FC] sm:text-2xl">
                    {dept} {selectedYear?.name ?? year} Exam Schedule
                  </h1>
                  <p className="mt-1 text-[0.75rem] text-[#71717A] dark:text-[#B2B2B2]">
                    {selectedDepartment?.name ?? "Selected department"}, level{" "}
                    {selectedYear?.name ?? year}
                  </p>
                </div>
              </div>

              <ThemeToggle />
            </div>

            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-[#5B6270] dark:text-[#B2B2B2]">
              <div className="inline-flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-[#6D7480] dark:text-[#B2B2B2]" />
                <span className="font-medium text-[#111827] dark:text-[#F0F6FC]">
                  {classes.length}
                </span>
                <span>classes</span>
              </div>

              <div className="hidden h-4 w-px bg-[#E4E4E7] dark:bg-[#303030] sm:block" />

              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#6D7480] dark:text-[#B2B2B2]" />
                <span className="font-medium text-[#111827] dark:text-[#F0F6FC]">
                  {totalDisplayedPapers}
                </span>
                <span>papers</span>
              </div>

              <div className="hidden h-4 w-px bg-[#E4E4E7] dark:bg-[#303030] sm:block" />

              <div className="inline-flex min-w-0 items-center gap-2">
                <CalendarDays className="h-4 w-4 flex-none text-[#6D7480] dark:text-[#B2B2B2]" />
                <span className="truncate font-medium text-[#111827] dark:text-[#F0F6FC]">
                  {firstExamDay && lastExamDay
                    ? `${firstExamDay} to ${lastExamDay}`
                    : "No exam dates loaded"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-1 py-5 sm:px-2 lg:px-0">
          <ExamView
            timetableData={examData}
            exportLabel={`${dept} ${selectedYear?.name ?? year} Exam Schedule`}
          />
        </div>
      </div>
    </div>
  );
}
