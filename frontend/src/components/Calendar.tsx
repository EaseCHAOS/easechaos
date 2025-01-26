import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  LayoutGrid,
  Calendar as CalendarDayIcon,
  ArrowLeft,
} from "lucide-react";
import clsx from "clsx";
import { WeekSchedule } from "../types";
import "react-day-picker/dist/style.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  downloadElementAsImage,
  downloadElementAsPDF,
} from "../utils/downloadUtils";
import ThemeToggle from "./ThemeToggle";

type ViewMode = "day" | "week";

// Replace direct imports with lazy imports
const WeekView = lazy(() => import("./WeekView"));
const DayView = lazy(() => import("./DayView"));

export default function Calendar() {
  const [schedule, setSchedule] = useState<WeekSchedule>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);
  const { dept, year } = useParams();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  const fetchSchedule = async (dept: string, year: string) => {
    const cacheKey = `schedule:${dept}:${year}`;
    const versionKey = `${cacheKey}:version`;

    const cachedData = localStorage.getItem(cacheKey);
    const cachedVersion = localStorage.getItem(versionKey);

    if (cachedData) {
      // Try to validate cache in background, but don't block rendering
      validateAndUpdateCache(dept, year, cachedData, cachedVersion).catch(
        console.error
      );
      return JSON.parse(cachedData);
    }

    try {
      return await fetchFresh(dept, year);
    } catch (error) {
      // If offline and no cache exists, throw error
      if (!navigator.onLine) {
        throw new Error("You are offline and no cached schedule is available");
      }
      throw error;
    }
  };

  const validateAndUpdateCache = async (
    dept: string,
    year: string,
    cachedData: string,
    cachedVersion: string | null
  ) => {
    // Add a debounce check
    const lastCheck = localStorage.getItem(`${dept}:${year}:lastCheck`);
    const now = Date.now();

    // Only check for updates every 30 minutes
    if (lastCheck && now - parseInt(lastCheck) < 30 * 60 * 1000) {
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/get_time_table",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: "Draft_2",
            class_pattern: `${dept} ${year}`,
          }),
        }
      );

      if (!response.ok) return;

      localStorage.setItem(`${dept}:${year}:lastCheck`, now.toString());
      const { data, version } = await response.json();

      if (version !== cachedVersion || JSON.stringify(data) !== cachedData) {
        localStorage.setItem(`schedule:${dept}:${year}`, JSON.stringify(data));
        localStorage.setItem(`schedule:${dept}:${year}:version`, version);
        setSchedule(data);
      }
    } catch (error) {
      console.error("Background validation failed:", error);
    }
  };

  const fetchFresh = async (dept: string, year: string) => {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "/get_time_table",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "Draft_2",
          class_pattern: `${dept} ${year}`,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch schedule");
    }

    const { data, version } = await response.json();
    localStorage.setItem(`schedule:${dept}:${year}`, JSON.stringify(data));
    localStorage.setItem(`schedule:${dept}:${year}:version`, version);
    return data;
  };

  useEffect(() => {
    setError(null);

    if (!dept || !year) {
      setError("Missing department or year");
      return;
    }

    const loadSchedule = async () => {
      try {
        const data = await fetchSchedule(dept, year);
        setSchedule(data);
      } catch (err) {
        setError((err as Error).message || "Failed to load schedule");
      }
    };

    loadSchedule();
  }, [dept, year]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
      if (
        downloadDropdownRef.current &&
        !downloadDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDownloadDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (viewMode !== "day") return;

      if (event.key === "ArrowLeft" && selectedDate.getDay() !== 1) {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
      }

      if (event.key === "ArrowRight" && selectedDate.getDay() !== 5) {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewMode, selectedDate]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const currentDaySchedule = schedule.find(
    (day) => day.day === dayNames[selectedDate.getDay() - 1]
  );

  // format both week and day view data
  const formatCellContent = (value: string) => {
    if (!value) return value;

    // Split the string at brackets to preserve venue information
    const [mainText, ...bracketsContent] = value.split(/(\(.*?\))/g);

    // Format only the main text (before brackets)
    const formattedMain = mainText
      // Remove program codes at start (e.g., "CE 1B 141", "CE 1A, CE 1B 141")
      .replace(/^(?:[A-Z]{2,3}\s+)+/g, "")
      // Remove program codes before numbers (e.g., "1B CE 141", "1A, 1B CE 141")
      .replace(/\s+[A-Z]{2,3}\s+(?=\d)/g, " ")
      // Remove multiple program codes (e.g., "SP, LA, GL 151", "CE, EE 141")
      .replace(/(?:[A-Z]{2,3},?\s*)+(?=\d)/g, "")
      // Remove program codes between group and number (e.g., "1A CE 141")
      .replace(/(\d[A-Z])\s+[A-Z]{2,3}\s+(\d)/g, "$1 $2")
      // Clean up extra spaces and commas
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s+/g, " ")
      .trim();

    // Rejoin with preserved brackets content
    return formattedMain + bracketsContent.join("");
  };

  // Format week view data
  const scheduleData = schedule.map((day) => ({
    ...day,
    data: day.data.map((slot) => ({
      ...slot,
      value: slot.value ? formatCellContent(slot.value) : null,
    })),
  }));

  // Format day view data
  const formattedDaySchedule = currentDaySchedule
    ? {
        ...currentDaySchedule,
        data: currentDaySchedule.data.map((slot) => ({
          ...slot,
          value: slot.value ? formatCellContent(slot.value) : null,
        })),
      }
    : undefined;

  return (
    <div className="bg-gray-50 dark:bg-[#02040A] h-screen">
      <div
        className={clsx(
          "h-full w-full relative",
          viewMode === "week" ? "max-w-full" : "w-full md:max-w-4xl md:mx-auto"
        )}
      >
        <div className="bg-white dark:bg-[#262626] rounded-none md:rounded-lg shadow-lg flex flex-col h-full">
          {!isOnline && (
            <div className="bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 text-sm text-yellow-800 dark:text-yellow-200 text-center">
              You're offline. Some features may be limited.
            </div>
          )}
          <div className="p-4 border-b dark:border-[#303030] sticky top-0 bg-white dark:bg-[#262626] z-50 rounded-t-md relative">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/")}
                    className="border border-[#1B1B1B] dark:border-[#303030] p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#303030]"
                  >
                    <ArrowLeft className="w-4 h-4 dark:text-[#B2B2B2]" />
                  </button>
                  <h1 className="text-2xl font-bold dark:text-[#F0F6FC]">
                    {viewMode === "week"
                      ? "Week's Schedule"
                      : format(selectedDate, "yyyy-MM-dd") ===
                        format(new Date(), "yyyy-MM-dd")
                      ? "Today"
                      : format(selectedDate, "EEEE")}
                  </h1>
                </div>
                {viewMode === "day" && (
                  <div className="relative">
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:text-[#F0F6FC]"
                    >
                      <CalendarIcon className="w-5 h-5" />
                      <span>{format(selectedDate, "MMM d, yyyy")}</span>
                    </button>
                    {showDatePicker && (
                      <div
                        ref={datePickerRef}
                        className="absolute left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 top-full mt-2 bg-white rounded-lg shadow-lg z-[1100]"
                      >
                        <DayPicker
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date);
                              setShowDatePicker(false);
                            }
                          }}
                          modifiers={{
                            disabled: (date) =>
                              date.getDay() === 0 || date.getDay() === 6,
                          }}
                          showOutsideDays
                          className="p-3"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center w-full sm:w-auto gap-4">
                <div className="flex">
                  <ThemeToggle />
                </div>
                {viewMode === "week" && (
                  <div className="relative z-[9999]">
                    <div
                      className="flex items-center gap-2"
                      onClick={() =>
                        setShowDownloadDropdown(!showDownloadDropdown)
                      }
                    >
                      <span className="text-sm font-medium dark:text-[#B2B2B2]">
                        Download
                      </span>
                      <button className="p-1 rounded-full border-2 border-gray-600 flex items-center dark:border-[#B2B2B2] dark:text-[#B2B2B2]">
                        <svg
                          className="w-2 h-2"
                          data-slot="icon"
                          fill="none"
                          strokeWidth="4"
                          stroke="currentColor"
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
                    {showDownloadDropdown && (
                      <div
                        ref={downloadDropdownRef}
                        className="absolute top-full right-0 mt-2 bg-white dark:bg-[#262626] rounded-lg shadow-xl border border-gray-200 dark:border-[#303030] py-1 z-[9999]"
                      >
                        <button
                          onClick={() => {
                            downloadElementAsPDF(
                              "week-schedule",
                              "Schedule.pdf"
                            );
                            setShowDownloadDropdown(false);
                          }}
                          className="w-full px-4 py-1 text-left hover:bg-gray-100 dark:hover:bg-[#3e3e3e] border-b border-gray-200 dark:border-[#303030]"
                        >
                          <span className="text-sm dark:text-[#B2B2B2]">
                            PDF
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            downloadElementAsImage(
                              "week-schedule",
                              "Schedule.png"
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
                    )}
                  </div>
                )}

                <div className="flex items-center bg-gray-100 dark:bg-[#303030] rounded-lg p-1 z-[1]">
                  <button
                    onClick={() => setViewMode("week")}
                    className={clsx(
                      "p-2 rounded-md",
                      viewMode === "week"
                        ? "bg-white dark:bg-[#262626] shadow-sm"
                        : "hover:bg-gray-200 dark:hover:bg-[#3e3e3e]"
                    )}
                  >
                    <LayoutGrid className="w-5 h-5 dark:text-[#B2B2B2]" />
                  </button>
                  <button
                    onClick={() => setViewMode("day")}
                    className={clsx(
                      "p-2 rounded-md",
                      viewMode === "day"
                        ? "bg-white dark:bg-[#262626] shadow-sm"
                        : "hover:bg-gray-200 dark:hover:bg-[#3e3e3e]"
                    )}
                  >
                    <CalendarDayIcon className="w-5 h-5 dark:text-[#B2B2B2]" />
                  </button>
                </div>

                {viewMode === "day" && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() - 1);
                        setSelectedDate(newDate);
                      }}
                      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#3e3e3e]"
                      disabled={selectedDate.getDay() === 1}
                    >
                      <ChevronLeft className="w-5 h-5 dark:text-[#B2B2B2]" />
                    </button>
                    <button
                      onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() + 1);
                        setSelectedDate(newDate);
                      }}
                      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#3e3e3e]"
                      disabled={selectedDate.getDay() === 5}
                    >
                      <ChevronRight className="w-5 h-5 dark:text-[#B2B2B2]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-2 md:px-4 z-0">
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  Loading...
                </div>
              }
            >
              {viewMode === "week" ? (
                <WeekView schedule={scheduleData} />
              ) : (
                <DayView schedule={formattedDaySchedule} />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
