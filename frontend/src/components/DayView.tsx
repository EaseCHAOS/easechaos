import React from 'react';
import { DaySchedule } from '../types';
import clsx from 'clsx';
import { COURSE_CODES, COLOR_SCHEMES, DEFAULT_COLOR } from '../constants/courseCodes';
import { useTheme } from '../context/ThemeContext'; // Import the theme hook


interface DayViewProps {
  schedule?: DaySchedule;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => {
  const hour = i + 7;
  
  if (hour === 12) {
    return '12 PM';
  }
  return hour > 12 
    ? `${hour - 12} PM` 
    : `${hour} AM`;
});

interface PositionedEvent {
  start: string;
  end: string;
  value: string;
  startPosition: number;
  duration: number;
  isOverlapping?: boolean;
  splitIndex?: number;
  totalSplits?: number;
  isContinuation?: boolean;
  continuationGroup?: string;
}

function convertTimeToNumber(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

const courseColorMap = new Map(
  COURSE_CODES.map((code, index) => [
    code, 
    COLOR_SCHEMES[index % COLOR_SCHEMES.length -1]
  ])
);

const getCourseColor = (value: string) => {
  const { theme } = useTheme();
  const match = value.match(/\b\d{3}\b/);
  if (!match) return DEFAULT_COLOR;
  
  const colorScheme = courseColorMap.get(match[0] as (typeof COURSE_CODES)[number]) || DEFAULT_COLOR;
  
  const isSystemTheme = theme === 'system';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  const currentTheme = isSystemTheme ? systemTheme : theme;
  
  if (currentTheme === 'dark') {
    return {
      bg: colorScheme.darkBg,
      border: colorScheme.darkBorder,
      text: colorScheme.darkText
    };
  }
  
  return {
    bg: colorScheme.bg,
    border: colorScheme.border,
    text: colorScheme.text
  };
}; 

function splitEventValue(value: string): string[] {
  return value.split('\n').filter(Boolean);
}

export default function DayView({ schedule }: DayViewProps) {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentTimePosition = React.useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeInHours = hours + minutes / 60;
    
    if (timeInHours < 7 || timeInHours > 20) {
      return null;
    }
    
    return ((timeInHours - 7) / 13) * 100;
  }, [currentTime]);

  if (!schedule) {
    return (
      <div className="flex items-center justify-center h-[700px] text-gray-500">
        No schedule available for this day
      </div>
    );
  }

  const processedEvents: PositionedEvent[] = schedule.data
    .filter((slot): slot is typeof slot & { value: string } => Boolean(slot.value))
    .flatMap(slot => {
      const startTime = convertTimeToNumber(slot.start);
      const endTime = convertTimeToNumber(slot.end);
      
      const startPosition = ((startTime - 7) / 13) * 100;
      const duration = ((endTime - startTime) / 13) * 100;
      
      const values = splitEventValue(slot.value);
      
      return values.map((value, index) => ({
        start: slot.start,
        end: slot.end,
        value,
        startPosition,
        duration,
        splitIndex: index,
        totalSplits: values.length,
        continuationGroup: value.match(/CE \d[A-Z] \d{3}(?:\s*\([^)]+\))?/)?.[0],
        isOverlapping: false
      }));
    });

  processedEvents.forEach((event, index) => {
    const overlappingEvents = processedEvents.filter((otherEvent, otherIndex) => {
      if (otherIndex === index) return false;
      const sameTimeSlot = 
        convertTimeToNumber(otherEvent.start) === convertTimeToNumber(event.start) &&
        convertTimeToNumber(otherEvent.end) === convertTimeToNumber(event.end);
      return sameTimeSlot;
    });
    
    if (overlappingEvents.length > 0) {
      event.isOverlapping = true;
      event.totalSplits = overlappingEvents.length + 1;
      event.splitIndex = overlappingEvents.findIndex(e => e.value > event.value) + 1;
    }
  });

  const mergedEvents = processedEvents.reduce((acc: PositionedEvent[], event) => {
    if (!event.continuationGroup) {
      acc.push(event);
      return acc;
    }

    const previousEvent = acc.find(e => 
      e.continuationGroup === event.continuationGroup && 
      convertTimeToNumber(e.end) === convertTimeToNumber(event.start)
    );

    if (previousEvent) {
      previousEvent.end = event.end;
      previousEvent.duration = ((convertTimeToNumber(event.end) - convertTimeToNumber(previousEvent.start)) / 13) * 100;
    } else {
      acc.push(event);
    }

    return acc;
  }, []);

  return (
    <div className="w-full h-[calc(100vh-8rem)] dark:bg-[#262626]">
      <div className="grid grid-cols-[45px_1fr] sm:grid-cols-[50px_1fr] gap-4 h-full relative pt-4 pb-6">
        <div className="sticky left-0 h-full">
          {timeSlots.map((time, index) => (
            <div
              key={time}
              className={clsx(
                "absolute text-xs sm:text-sm text-gray-700 dark:text-[#B2B2B2]"              )}
              style={{
                top: `${(index / (timeSlots.length - 1)) * 100}%`,
                right: '0.5rem sm:1rem',
                transform: 'translateY(-50%)'
              }}
            >
              {time}
            </div>
          ))}
        </div>

        <div className="relative border-l border-gray-200 dark:border-[#303030] pt-2 h-full">
          {currentTimePosition !== null && (
            <div 
              className="absolute w-full h-[2px] bg-gray-500 dark:bg-[#4593F8] z-10"
              style={{ 
                top: `${currentTimePosition}%`,
                transform: 'translateY(-50%)'
              }}
            >
              <div 
                className="absolute left-0 w-2 h-2 rounded-full bg-gray-500 dark:bg-[#4593F8]" 
                style={{ transform: 'translate(-50%, -25%)' }}
              />
            </div>
          )}

          <div className="absolute inset-0 pt-2 pb-4">
            {timeSlots.map((hour, index) => (
              <div
                key={hour}
                className={clsx(
                  "absolute w-full border-t border-gray-200 dark:border-[#303030]",
                  (index % 2 !== 0) ? "bg-gray-100 dark:bg-inherit" : "bg-gray-200 dark:bg-[#303030]"
                )}
                style={{ 
                  top: `${(index / (timeSlots.length - 1)) * 100}%`,
                  height: `${(index % 2 === 0 ? 100 / (timeSlots.length - 1) : 0)}%`,
                  paddingTop: `${(index % 2 === 0 ? 0 : 50)}%`                }}
              />
            ))}
          </div>

          {mergedEvents.map((event, index) => {
            const colors = getCourseColor(event.value);
            const width = event.isOverlapping || (event.totalSplits ?? 1) > 1
              ? `${95 / ((event.totalSplits ?? 1))}%`
              : '95%';
            
            return (
              <div
                key={index}
                className={clsx(
                  `absolute p-2 rounded-md border border-l-4 border-l-[${colors.bg}]`,
                  colors.bg, colors.border,
                  "hover:brightness-95 transition-colors cursor-pointer overflow-hidden"
                )}
                style={{
                  top: `${event.startPosition}%`,
                  height: `${event.duration}%`,
                  minHeight: '40px',
                  left: event.isOverlapping || (event.totalSplits ?? 1) > 1
                    ? `${(event.splitIndex! * 47.5) }%`
                    : '0',
                  width,
                  maxWidth: '95%'
                }}
              >
                <div className={clsx(
                  "text-sm break-words overflow-hidden",
                  colors.text
                )}>
                  {event.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}