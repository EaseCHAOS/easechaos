import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ExamView from "../components/ExamView";
import ThemeToggle from "../components/ThemeToggle";
import { TimetableData } from "../types";

export default function ExamPage() {
  const { dept, year } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examData, setExamData] = useState<TimetableData | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>("all");

  useEffect(() => {
    if (!dept || !year) {
      setError("Missing department or year");
      return;
    }

    const fetchExamData = async () => {
      setIsLoading(true);
      setError(null);

      try {
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

        const data = await response.json();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#02040A] flex items-center justify-center">
        <div className="text-[#71717A] dark:text-[#D4D4D8]">
          Loading exam timetable...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#02040A] flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#02040A] flex items-center justify-center">
        <div className="text-[#71717A] dark:text-[#D4D4D8]">
          No exam timetable found.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#02040A] min-h-screen">
      <div className="h-full w-full relative max-w-6xl mx-auto p-4">
        <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg flex flex-col h-full">
          <div className="p-4 border-b dark:border-[#303030] sticky top-0 bg-white dark:bg-[#262626] z-50 rounded-t-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="border border-[#1B1B1B] dark:border-[#303030] p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#303030]"
                >
                  <ArrowLeft className="w-4 h-4 dark:text-[#B2B2B2]" />
                </button>
                <h1 className="text-2xl font-bold dark:text-[#F0F6FC]">
                  Exam Schedule
                </h1>
              </div>

              <div className="flex items-center gap-4 z-10">
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
                <ThemeToggle props="-right-5" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <ExamView timetableData={examData} selectedClass={selectedClass} />
          </div>
        </div>
      </div>
    </div>
  );
}
