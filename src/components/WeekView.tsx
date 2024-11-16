import React from 'react';
import { WeekSchedule } from '../types';
import clsx from 'clsx';

interface WeekViewProps {
  schedule: WeekSchedule;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 19 (7 PM)
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function convertTo24Hour(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (hours < 7) { // If hour is less than 7, it's PM
    return hours + 12 + (minutes || 0) / 60;
  }
  return hours + (minutes || 0) / 60;
}

export default function WeekView({ schedule }: WeekViewProps) {
  const processedSchedule = schedule.map(day => ({
    ...day,
    events: day.data
      .filter((slot): slot is typeof slot & { value: string } => Boolean(slot.value))
      .map(slot => {
        // Convert times to 24-hour format for positioning
        const startTime = convertTo24Hour(slot.start);
        const endTime = convertTo24Hour(slot.end);
        
        const startPosition = (startTime - 7) / (timeSlots.length - 1) * 100;
        const endPosition = (endTime - 7) / (timeSlots.length - 1) * 100;
        
        return {
          start: slot.start,
          end: slot.end,
          value: slot.value,
          startPosition,
          duration: endPosition - startPosition
        };
      })
      .sort((a, b) => a.startPosition - b.startPosition)
  }));

  return (
    <div className="relative">
      <div className="overflow-x-auto py-2">
        <div className="min-w-[850px]">
          {/* Days header */}
          <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr_1fr] mb-2">
            <div className="sticky left-0 bg-white z-10" /> {/* sticky empty cell to cover day headers on scroll*/}
            {days.map((day) => (
              <div key={day} className="text-center font-medium text-gray-700 px-4 min-w-[150px]">
                {day}
              </div>
            ))}
          </div>

          <div className="h-[650px] min-w-[800px]">
            <div className="grid grid-cols-[100px_minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)_minmax(150px,1fr)] h-full">
              {/* Time labels */}
              <div className="sticky left-0 h-full bg-white z-10">
                {timeSlots.map((hour, index) => (
                  <div
                    key={hour}
                    className="absolute text-sm text-gray-500"
                    style={{
                      top: `${(index / (timeSlots.length - 1)) * 100}%`,
                      right: '1rem',
                      transform: 'translateY(-50%)'
                    }}
                  >
                    {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                  </div>
                ))}
              </div>

              {/* Days */}
              {days.map((day) => {
                const daySchedule = processedSchedule.find((s) => s.day === day);

                return (
                  <div key={day} className="relative border-l border-gray-200">
             

                    {/* Time slot lines */}
                    <div className="absolute inset-0">
                      {timeSlots.map((hour, index) => (
                        <div
                          key={hour}
                          className="absolute w-full border-t border-gray-200"
                          style={{ top: `${(index / (timeSlots.length - 1)) * 100}%` }}
                        />
                      ))}
                    </div>

                    {/* Events */}
                    {daySchedule?.events.map((slot, index) => {
                      return (
                        <div
                          key={index}
                          className={clsx(
                            "absolute w-[calc(100%-1px)] ml-[1px] p-1 rounded-md",
                            "bg-blue-100 border border-blue-200",
                            "hover:bg-blue-200 transition-colors cursor-pointer"
                          )}
                          style={{
                            top: `${slot.startPosition}%`,
                            height: `${slot.duration}%`,
                            minHeight: '30px'
                          }}
                        >
                          <div className="text-xs text-blue-700 line-clamp-2">
                            {slot.value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}