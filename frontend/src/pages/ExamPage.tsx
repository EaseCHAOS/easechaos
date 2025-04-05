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
              filename: "Draft_3",
              class_pattern: `${dept} ${year}`,
              is_exam: false,
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

  // For development/testing, use sample data if API call isn't implemented yet
  const sampleData: TimetableData = {
    data: [
      {
        day: "Monday, 14th April 2025",
        data: [
          {
            start: "11:00",
            end: "14:00",
            value: "COMPUTER NETWORKS",
            class: "CE 4A",
            location: "FF 3",
            invigilator: null,
          },
        ],
      },
      {
        day: "Monday, 14th April 2025",
        data: [
          {
            start: "11:00",
            end: "14:00",
            value: "COMPUTER NETWORKS",
            class: "CE 4B",
            location: "FI A3",
            invigilator: null,
          },
        ],
      },
      // Add more sample data as needed
    ],
    version: "sample-version",
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#02040A] min-h-screen">
      <div className="h-full w-full relative max-w-6xl mx-auto p-4">
        <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg flex flex-col h-full">
          <div className="p-4 border-b dark:border-[#303030] top-0 bg-white dark:bg-[#262626] z-50 rounded-t-md relative">
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

              <div className="flex">
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {examData ? (
              <ExamView timetableData={examData} />
            ) : (
              // Use sample data for development/testing
              <ExamView timetableData={sampleData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
