import React, { useMemo } from 'react';
import { WeekSchedule } from '../types';
import clsx from 'clsx';
import { COURSE_CODES, COLOR_SCHEMES, DEFAULT_COLOR } from '../constants/courseCodes';

interface WeekViewProps {
  schedule: WeekSchedule;
}

const timeSlots = Array.from({ length: 27 }, (_, i) => ({ 
  hour: Math.floor(i/2) + 7,
  minute: i % 2 === 0 ? '00' : '30'
}));
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function convertTimeToNumber(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

function splitEventValue(value: string): string[] {
  return value.split('\n').filter(Boolean);
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
    const timeInHours = hours + minutes / 60;
    const totalHours = 13; // 7 AM to 8 PM
    return ((timeInHours - 7) / totalHours) * 100;
  }, [currentTime]);

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
      .flatMap(slot => {
        const startTime = convertTimeToNumber(slot.start);
        const endTime = convertTimeToNumber(slot.end);
        
        const totalSlots = timeSlots.length;
        
        const startSlot = (startTime - 7) * 2;
        const endSlot = (endTime - 7) * 2;
        
        const startPosition = (startSlot / totalSlots) * 100;
        const duration = ((endSlot - startSlot) / totalSlots) * 100;
        
        // Split the value if it contains \n
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
      <div className="overflow-x-auto">
        <div className="min-w-[2000px] pb-2">
          <div className="grid grid-cols-[100px_repeat(27,1fr)] mb-2 sticky top-0 bg-white z-10 pb-2 h-full">
            <div className="font-medium text-gray-700 bg-white sticky min-w-[100px] left-0 flex justify-end z-[100]"/>
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
          <div className="space-y-1 relative">
            <div 
              className="absolute h-full w-[2px] bg-gray-500 z-20"
              style={{ 
                left: `${currentTimePosition}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {/* knob  */}
              <div 
                className="absolute top-0 w-2 h-2 rounded-full bg-gray-500"
                style={{ transform: 'translate(-35%, -50%)' }}
              />
            </div>

            {days.map((day) => {
              const daySchedule = processedSchedule.find((s) => s.day === day);
              
              return (
                <div key={day} className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium text-gray-700 py-2 sticky left-0 flex justify-end z-[100] bg-white pr-[6px]">
                    {day}
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
                            "absolute p-1 rounded-md z-20",
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