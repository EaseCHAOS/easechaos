import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { ArrowLeft, Building2, CalendarDays, Search } from "lucide-react";
import SEO from "../components/SEO";
import ThemeToggle from "../components/ThemeToggle";

interface HallExamEntry {
  course_no: string;
  course_name: string;
  class: string;
  start: string;
  end: string;
  location: string;
  invigilator: string;
}

interface HallScheduleDay {
  day: string;
  date: string;
  data: HallExamEntry[];
}

interface HallScheduleData {
  hall: string;
  version: string;
  data: HallScheduleDay[];
}

interface HallScheduleResponse {
  hall: string;
  version: string;
  data: HallScheduleDay[];
}

const PERIOD_OPTIONS = [
  { value: "", label: "All sessions" },
  { value: "M", label: "Morning (7:00 - 10:00)" },
  { value: "A", label: "Afternoon (11:00 - 2:00)" },
  { value: "E", label: "Evening (3:00 - 6:00)" },
];

const panelClasses =
  "border border-[#E4E4E7] bg-white dark:border-[#303030] dark:bg-[#262626]";
const primaryTextClasses = "text-[#111827] dark:text-[#F0F6FC]";
const mutedTextClasses = "text-[#71717A] dark:text-[#B2B2B2]";
const accentSoftClasses =
  "bg-blue-50 text-blue-700 dark:bg-[#1E3A5F] dark:text-[#BFDBFE]";

function formatSessionTime(start: string): string {
  if (!start) return "";
  const lower = start.toLowerCase();
  if (lower.includes("am")) return "Morning";
  if (lower.includes("pm")) return "Evening";
  return "";
}

export default function HallSchedulePage() {
  const navigate = useNavigate();
  const [halls, setHalls] = useState<string[]>([]);
  const [hall, setHall] = useState("");
  const [date, setDate] = useState("");
  const [period, setPeriod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<HallScheduleData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchHalls = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/get_halls?t=${timestamp}`,
        );
        if (!response.ok) {
          throw new Error("Failed to load hall list");
        }
        const data = (await response.json()) as { halls: string[] };
        if (!cancelled) {
          setHalls(data.halls);
        }
      } catch {
        // Non-fatal: the page still works with free-text hall entry.
      }
    };

    fetchHalls();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!hall.trim()) {
      setError("Enter a lecture hall to search.");
      return;
    }

    setIsSearching(true);
    setIsLoading(true);
    setError(null);

    try {
      const timestamp = new Date().getTime();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/get_hall_schedule?t=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
          body: JSON.stringify({
            hall: hall.trim(),
            date: date || null,
            period: period || null,
          }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          detail?: string;
        } | null;
        throw new Error(payload?.detail || "Failed to fetch hall schedule");
      }

      const data = (await response.json()) as HallScheduleResponse;
      setSchedule(data);
    } catch (err) {
      setError((err as Error).message || "Failed to fetch hall schedule");
      setSchedule(null);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const totalEntries = schedule?.data.reduce(
    (sum, day) => sum + day.data.length,
    0,
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FAFAFA] dark:bg-[#02040A]">
      <SEO
        title="Hall Schedule Admin"
        description="Find every class writing in a specific lecture hall across the exam period."
      />
      <div className="relative h-full w-full overflow-x-hidden px-3 py-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="z-20 border-b bg-[#FAFAFA] px-2 py-3 dark:border-[#303030] dark:bg-[#02040A] sm:sticky sm:top-0 lg:px-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <button
                onClick={() => navigate("/")}
                className="rounded-md border border-[#1B1B1B] p-1.5 hover:bg-gray-100 dark:border-[#303030] dark:bg-[#262626] dark:hover:bg-[#303030]"
              >
                <ArrowLeft className="h-4 w-4 dark:text-[#B2B2B2]" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-bold tracking-tight text-[#111827] dark:text-[#F0F6FC] sm:text-2xl">
                  Hall Schedule
                </h1>
                <p className="mt-1 hidden text-[0.75rem] text-[#71717A] dark:text-[#B2B2B2] sm:block">
                  Admin lookup. Every class writing in a lecture hall
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-1 py-5 sm:px-2 lg:px-0">
          <form
            onSubmit={handleSearch}
            className={clsx("overflow-hidden rounded-lg", panelClasses)}
          >
            <div className="space-y-4 p-4 sm:p-6">
              <div>
                <label
                  htmlFor="hall-input"
                  className={clsx(
                    "mb-1.5 block text-sm font-medium",
                    primaryTextClasses,
                  )}
                >
                  Lecture hall
                </label>
                <input
                  id="hall-input"
                  type="text"
                  value={hall}
                  onChange={(event) => setHall(event.target.value)}
                  placeholder="e.g. FF 1"
                  list="hall-suggestions"
                  autoComplete="off"
                  className="h-11 w-full rounded-md border border-[#E4E4E7] bg-[#F4F4F5] px-4 text-sm text-gray-900 shadow-sm placeholder:text-[#71717A] focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-[#303030] dark:bg-[#262626] dark:text-[#D4D4D8]"
                />
                <datalist id="hall-suggestions">
                  {halls.map((hallName) => (
                    <option key={hallName} value={hallName} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="date-input"
                    className={clsx(
                      "mb-1.5 block text-sm font-medium",
                      primaryTextClasses,
                    )}
                  >
                    Date (optional)
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="h-11 w-full rounded-md border border-[#E4E4E7] bg-[#F4F4F5] px-4 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-[#303030] dark:bg-[#262626] dark:text-[#D4D4D8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="period-input"
                    className={clsx(
                      "mb-1.5 block text-sm font-medium",
                      primaryTextClasses,
                    )}
                  >
                    Session (optional)
                  </label>
                  <select
                    id="period-input"
                    value={period}
                    onChange={(event) => setPeriod(event.target.value)}
                    className="h-11 w-full rounded-md border border-[#E4E4E7] bg-[#F4F4F5] px-4 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-[#303030] dark:bg-[#262626] dark:text-[#D4D4D8]"
                  >
                    {PERIOD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2457A7] py-3 px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1e4a8f] disabled:opacity-60 dark:bg-[#4593F8] dark:text-[#02040A] dark:hover:bg-[#5ba3fa] sm:w-auto"
              >
                <Search className="h-4 w-4" />
                {isSearching ? "Searching..." : "Find classes"}
              </button>
            </div>
          </form>

          {error ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-white px-4 py-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-[#262626] dark:text-red-400">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="mt-8 flex items-center justify-center py-12 text-sm text-[#71717A] dark:text-[#B2B2B2]">
              Loading hall schedule...
            </div>
          ) : null}

          {!isLoading && schedule ? (
            schedule.data.length === 0 ? (
              <div
                className={clsx(
                  "mt-5 rounded-lg border border-dashed border-[#D4D4D8] bg-[#FAFAFA] px-6 py-12 text-center dark:border-[#303030] dark:bg-[#262626]",
                )}
              >
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#F4F4F5] text-[#2457A7] dark:bg-[#303030] dark:text-[#4593F8]">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3
                  className={clsx(
                    "text-xl font-semibold tracking-tight",
                    primaryTextClasses,
                  )}
                >
                  No exams scheduled in {schedule.hall}
                </h3>
                <p
                  className={clsx(
                    "mx-auto mt-3 max-w-xl text-sm leading-6",
                    mutedTextClasses,
                  )}
                >
                  Try a different hall, date, or session filter.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#5B6270] dark:text-[#B2B2B2]">
                  <div className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#6D7480] dark:text-[#B2B2B2]" />
                    <span className="font-medium text-[#111827] dark:text-[#F0F6FC]">
                      {schedule.hall}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-[#E4E4E7] dark:bg-[#303030]" />
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#6D7480] dark:text-[#B2B2B2]" />
                    <span className="font-medium text-[#111827] dark:text-[#F0F6FC]">
                      {schedule.data.length}
                    </span>
                    <span>
                      day{schedule.data.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-[#E4E4E7] dark:bg-[#303030]" />
                  <div className="inline-flex items-center gap-2">
                    <span className="font-medium text-[#111827] dark:text-[#F0F6FC]">
                      {totalEntries}
                    </span>
                    <span>entries</span>
                  </div>
                </div>

                {schedule.data.map((day) => (
                  <section
                    key={day.date}
                    className={clsx("overflow-hidden rounded-lg", panelClasses)}
                  >
                    <div className="flex items-center justify-between border-b border-[#E4E4E7] bg-[#FAFAFA] px-4 py-3 dark:border-[#303030] dark:bg-[#303030]">
                      <h3
                        className={clsx(
                          "text-base font-semibold",
                          primaryTextClasses,
                        )}
                      >
                        {day.day}
                      </h3>
                      <span className="text-sm text-[#71717A] dark:text-[#B2B2B2]">
                        {day.data.length}{" "}
                        {day.data.length === 1 ? "class" : "classes"}
                      </span>
                    </div>

                    <div className="divide-y divide-[#E4E4E7] dark:divide-[#303030]">
                      {day.data.map((entry) => (
                        <div
                          key={`${day.date}-${entry.course_no}-${entry.class}-${entry.start}-${entry.location}`}
                          className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={clsx(
                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                                  accentSoftClasses,
                                )}
                              >
                                {formatSessionTime(entry.start)}
                              </span>
                              <span className="text-sm font-semibold text-[#111827] dark:text-[#F0F6FC]">
                                {entry.course_name}
                              </span>
                              <span className="text-sm text-[#71717A] dark:text-[#B2B2B2]">
                                {entry.course_no}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-[#71717A] dark:text-[#B2B2B2]">
                              {entry.start} - {entry.end} ·{" "}
                              {entry.location}
                            </div>
                          </div>
                          <div className="flex flex-none items-center gap-4 text-sm">
                            <span className="font-medium text-[#111827] dark:text-[#F0F6FC]">
                              {entry.class}
                            </span>
                            {entry.invigilator ? (
                              <span className="max-w-40 truncate text-xs text-[#71717A] dark:text-[#B2B2B2]">
                                {entry.invigilator}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
