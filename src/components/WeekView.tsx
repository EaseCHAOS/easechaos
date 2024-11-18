import React, { useMemo } from 'react';
import { WeekSchedule } from '../types';
import clsx from 'clsx';
import { COURSE_CODES, COLOR_SCHEMES, DEFAULT_COLOR } from '../constants/courseCodes';

interface WeekViewProps {
  schedule: WeekSchedule;
}

const timeSlots = Array.from({ length: 27 }, (_, i) => ({
  hour: Math.floor(i / 2) + 7,
  minute: i % 2 === 0 ? '00' : '30'
}));
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const dayAbbreviations: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri'
};

function convertTimeToNumber(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

function splitEventValue(value: string): string[] {
  const lines = value.split('\n').filter(Boolean);

  // Check if lines contain the same course code
  const getCourseCode = (line: string) => {
    const match = line.match(/\b\d{3}\b/);
    return match ? match[0] : '';
  };

  const firstCourseCode = getCourseCode(lines[0]);
  if (lines.every(line => getCourseCode(line) === firstCourseCode)) {
    return [lines[0]]; // Return only first occurrence if same course
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

    const startTimeInMinutes = 7 * 60;
    const endTimeInMinutes = 20 * 60;
    const currentTimeInMinutes = (hours * 60) + minutes;
    const totalMinutes = endTimeInMinutes - startTimeInMinutes;

    const position = ((currentTimeInMinutes - startTimeInMinutes) / totalMinutes) * 100;

    return Math.max(0, Math.min(position, 100))  * 0.987  // I have no idea why this works. Already spent 13hrs on this. Don't touch it. If you do, you sure as hell must know what you're doing.
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
    const match = value.match(/\b\d{3}\b/);
    if (!match) return DEFAULT_COLOR;
    return courseColorMap.get(match[0]) || DEFAULT_COLOR;
  };

  const processedSchedule = schedule.map(day => ({
    ...day,
    events: day.data
      .filter((slot): slot is typeof slot & { value: string } => Boolean(slot.value))
      .reduce((acc, current) => {
        const previousEvent = acc[acc.length - 1];

        const isSameCourse = previousEvent?.value === current.value;
        const isSequential = previousEvent?.end === current.start ||
          (previousEvent?.end === "12:00" && current.start === "12:30");

        if (isSameCourse && isSequential) {
          // Merge the events by extending the previous event's end time
          return [
            ...acc.slice(0, -1),
            {
              ...previousEvent,
              end: current.end
            }
          ];
        }

        return [...acc, current];
      }, [] as typeof day.data)
      .flatMap(slot => {
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
          totalSplits: values.length
        }));
      })
      .sort((a, b) => a.startPosition - b.startPosition)
  }));

  return (
    <div className="relative w-full h-[700px]">
      
      <div id="week-schedule" className="overflow-x-auto bg-white">
        <div className="min-w-[2000px] pb-2">
          <div className="grid grid-cols-[100px_repeat(27,1fr)] mb-2 sticky top-0 bg-white z-10 pb-2 h-full">
            <div className="font-medium text-gray-700 bg-white sticky min-w-[100px] right-0 flex justify-end z-[100]" />
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className="text-center font-medium text-gray-700 text-xs whitespace-nowrap -ml-[50%]"
              >
                {`${slot.hour}:${slot.minute}`}
              </div>
            ))}
          </div>

          {/* Days and events grid */}
          <div className="space-y-1 relative bg-white z-[100]">
            <div
              className="absolute h-full w-[2px] bg-gray-500 z-[50] time-indicator"
              style={{
                left: `${currentTimePosition}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div
                className="absolute top-0 w-2 h-2 rounded-full bg-gray-500"
                style={{ transform: 'translate(-35%, -50%)' }}
              />
            </div>

            {days.map((day) => {
              const daySchedule = processedSchedule.find((s) => s.day === day);

              return (
                <div key={day} className="grid grid-cols-[37px_1fr] sm:grid-cols-[45px_1fr] gap-2">
                  <div className="font-medium bg-white text-gray-700 text-[14px] py-2 sticky left-0 flex z-[100]">
                    {dayAbbreviations[day]}
                  </div>

                  {/* time slots and events */}
                  <div className="relative h-28 bg-gray-50 rounded-lg">
                    {/* time boundary lines */}
                    <div className="absolute inset-0 grid grid-cols-[repeat(27,1fr)] pointer-events-none">
                      {timeSlots.map((_, index) => (
                        <div
                          key={index}
                          className={clsx(
                            "border-l border-gray-200 h-full",
                            index === 0 && "border-l-0",
                            index === timeSlots.length - 1 && "border-r"
                          )}
                        />
                      ))}
                    </div>

                    {/* Events */}
                    {daySchedule?.events.map((slot, index) => {
                      const colors = getCourseColor(slot.value);
                      return (
                        <div
                          key={index}
                          className={clsx(
                            `absolute p-2 rounded-md border border-l-4 border-l-[${colors.bg}]`,
                            colors.bg, colors.border,
                            "hover:brightness-95 transition-colors cursor-pointer",
                            "flex items-center justify-center"
                          )}
                          style={{
                            left: `${slot.startPosition}%`,
                            width: `${slot.duration}%`,
                            top: slot.totalSplits > 1 ? `${(slot.splitIndex * 100) / slot.totalSplits}%` : 0,
                            height: slot.totalSplits > 1 ? `${100 / slot.totalSplits}%` : '100%'
                          }}
                        >
                          <div className={clsx(
                            "text-xs line-clamp-2 overflow-hidden text-ellipsis text-center",
                            colors.text
                          )}>
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