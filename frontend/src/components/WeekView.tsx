import React, { useMemo } from "react";
import { WeekSchedule } from "../types";
import clsx from "clsx";
import {
  COURSE_CODES,
  COLOR_SCHEMES,
  DEFAULT_COLOR,
} from "../constants/courseCodes";
import { useTheme } from "../context/ThemeContext";

interface WeekViewProps {
  schedule: WeekSchedule;
}

const timeSlots = Array.from({ length: 27 }, (_, i) => ({
  hour: String(Math.floor(i / 2) + 7).padStart(2, "0"),
  minute: i % 2 === 0 ? "00" : "30",
}));
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const dayAbbreviations: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
};

function convertTimeToNumber(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
}

function splitEventValue(value: string): string[] {
  const lines = value.split("\n").filter(Boolean);

  const getCourseCode = (line: string) => {
    const match = line.match(/\b\d{3}\b/);
    return match ? match[0] : "";
  };

  const firstCourseCode = getCourseCode(lines[0]);
  if (lines.every((line) => getCourseCode(line) === firstCourseCode)) {
    return [lines[0]];
  }

  return lines;
}

export default function WeekView({ schedule }: WeekViewProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentTimePosition = React.useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    // Hide indicator if outside 7am-8pm
    if (hours < 7 || hours > 20) {
      return null;
    }

    const columnWidth = 100 / 24;
    const hoursSince7am = hours - 7;
    const totalMinutesSince7am = hoursSince7am * 60 + minutes;
    const columnPosition = totalMinutesSince7am / 30;

    return columnPosition * columnWidth;
  }, [currentTime]);

  console.log(currentTimePosition);

  const courseColorMap = useMemo(() => {
    const map = new Map();
    COURSE_CODES.forEach((code, index) => {
      const colorIndex = index % COLOR_SCHEMES.length;
      map.set(code, COLOR_SCHEMES[colorIndex]);
    });
    return map;
  }, []);

  const getCourseColor = (value: string) => {
    const { theme } = useTheme();
    const match = value.match(/\b\d{3}\b/);
    if (!match) return DEFAULT_COLOR;

    const colorScheme =
      courseColorMap.get(match[0] as (typeof COURSE_CODES)[number]) ||
      DEFAULT_COLOR;

    const isSystemTheme = theme === "system";
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const currentTheme = isSystemTheme ? systemTheme : theme;

    if (currentTheme === "dark") {
      return {
        bg: colorScheme.darkBg,
        border: colorScheme.darkBorder,
        text: colorScheme.darkText,
      };
    }

    return {
      bg: colorScheme.bg,
      border: colorScheme.border,
      text: colorScheme.text,
    };
  };

  const processedSchedule = schedule.map((day) => ({
    ...day,
    events: day.data
      .filter((slot): slot is typeof slot & { value: string } =>
        Boolean(slot.value),
      )
      .reduce(
        (acc, current) => {
          const previousEvent = acc[acc.length - 1];

          const isSameCourse =
            previousEvent?.value?.trim() === current.value.trim();
          const isSequential =
            previousEvent?.end === current.start ||
            (previousEvent?.end === "12:00" && current.start === "12:30");

          const isHorizontalDuplicate =
            previousEvent?.start === current.start &&
            previousEvent?.end === current.end &&
            previousEvent?.value?.trim() === current.value.trim();

          if ((isSameCourse && isSequential) || isHorizontalDuplicate) {
            return [
              ...acc.slice(0, -1),
              {
                ...previousEvent,
                end: isSequential ? current.end : previousEvent.end,
                horizontalSpan: isHorizontalDuplicate
                  ? (previousEvent.horizontalSpan || 1) + 1
                  : 1,
              },
            ];
          }

          return [...acc, { ...current, horizontalSpan: 1 }];
        },
        [] as ((typeof day.data)[0] & { horizontalSpan?: number })[],
      )
      .flatMap((slot) => {
        if (!slot.value) return [];

        const startTime = convertTimeToNumber(slot.start);
        const endTime = convertTimeToNumber(slot.end);

        const totalSlots = timeSlots.length;
        const startSlot = (startTime - 7) * 2;
        const endSlot = (endTime - 7) * 2;

        const startPosition = (startSlot / totalSlots) * 100;
        const duration = ((endSlot - startSlot) / totalSlots) * 100;

        const values = splitEventValue(slot.value);

        return values.map((value, index) => ({
          start: slot.start,
          end: slot.end,
          value,
          startPosition,
          duration,
          splitIndex: index,
          totalSplits: values.length,
          horizontalSpan: slot.horizontalSpan || 1,
        }));
      })
      .sort((a, b) => a.startPosition - b.startPosition),
  }));

  return (
    <div className="relative h-full overflow-x-auto">
      <div
        id="week-schedule"
        className="h-full bg-white dark:bg-[#262626] min-w-[2000px]"
      >
        <div className="h-full">
          <div className="grid grid-cols-[45px_1fr] sticky top-0 bg-white dark:bg-[#262626] z-10 py-2">
            <div className="h-4" />
            <div className="flex-1 grid grid-cols-[repeat(27,1fr)] relative">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="text-left font-medium text-gray-700 dark:text-[#B2B2B2] text-xs whitespace-nowrap"
                  style={{
                    gridColumn: index + 1,
                  }}
                >
                  {`${slot.hour}:${slot.minute}`}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-[0.1rem] pb-12 relative bg-white dark:bg-[#262626] z-[100] h-[calc(100%-2rem)]">
            {currentTimePosition !== null && (
              <div
                className="absolute h-full w-[2px] bg-gray-500 dark:bg-[#4593F8] z-[50] time-indicator"
                style={{
                  left: `${currentTimePosition + 0.6}%`,
                  transform: "translateX(-1px)",
                }}
              >
                <div
                  className="absolute top-0 w-2 h-2 rounded-full bg-gray-500 dark:bg-[#4593F8]"
                  style={{ transform: "translate(-35%, -50%)" }}
                />
              </div>
            )}

            {days.map((day) => {
              const daySchedule = processedSchedule.find((s) => s.day === day);

              return (
                <div
                  key={day}
                  className="grid grid-cols-[37px_1fr] sm:grid-cols-[45px_1fr] gap-2 h-[calc(100%/5)]"
                >
                  <div className="font-medium bg-white dark:bg-[#262626] text-gray-700 dark:text-[#B2B2B2] text-[14px] py-2 sticky left-0 flex z-[100]">
                    {dayAbbreviations[day]}
                  </div>

                  <div className="relative h-full bg-gray-50 dark:bg-[#262626] rounded-lg">
                    <div className="absolute inset-0 grid grid-cols-[repeat(27,1fr)] pointer-events-none">
                      {timeSlots.map((_, index) => (
                        <div
                          key={index}
                          className={clsx(
                            "border-l border-gray-200 dark:border-[#303030] h-full",
                            index === 0 && "border-l-0",
                            index === timeSlots.length - 1 && "border-r",
                            index % 2 !== 0
                              ? "bg-gray-100 dark:bg-inherit"
                              : "bg-gray-200 dark:bg-[#303030]",
                          )}
                        />
                      ))}
                    </div>

                    {daySchedule?.events.map((slot, index) => {
                      const colors = getCourseColor(slot.value);
                      return (
                        <div
                          key={index}
                          className={clsx(
                            `absolute p-2 rounded-md border border-l-4 border-l-[${colors.bg}]`,
                            colors.bg,
                            colors.border,
                            "hover:brightness-95 transition-colors cursor-pointer",
                            "flex items-center justify-center",
                          )}
                          style={{
                            left: `${slot.startPosition}%`,
                            width: `${
                              slot.duration * (slot.horizontalSpan || 1)
                            }%`,
                            top:
                              slot.totalSplits > 1
                                ? `${
                                    (slot.splitIndex * 100) / slot.totalSplits
                                  }%`
                                : 0,
                            height:
                              slot.totalSplits > 1
                                ? `${100 / slot.totalSplits}%`
                                : "100%",
                          }}
                        >
                          <div
                            className={clsx(
                              "text-xs line-clamp-2 overflow-hidden text-ellipsis text-center",
                              colors.text,
                            )}
                          >
                            {slot.value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
