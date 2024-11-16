import React from 'react';
import { WeekSchedule } from '../types';
import clsx from 'clsx';

interface WeekViewProps {
  schedule: WeekSchedule;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function WeekView({ schedule }: WeekViewProps) {
  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
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
                const daySchedule = schedule.find((s) => s.day === day);

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
                    {daySchedule?.data.map((slot, index) => {
                      if (!slot.value) return null;

                      const startHour = parseInt(slot.start.split(':')[0]);
                      const startMinute = parseInt(slot.start.split(':')[1]);
                      const endHour = parseInt(slot.end.split(':')[0]);
                      const endMinute = parseInt(slot.end.split(':')[1]);

                      const totalHours = timeSlots.length - 1;
                      const startPosition = ((startHour - 7) + startMinute / 60) / totalHours * 100;
                      const duration = (endHour - startHour + (endMinute - startMinute) / 60) / totalHours * 100;

                      return (
                        <div
                          key={index}
                          className={clsx(
                            "absolute w-[calc(100%-1px)] ml-[1px] p-1 rounded-md",
                            "bg-blue-100 border border-blue-200",
                            "hover:bg-blue-200 transition-colors cursor-pointer"
                          )}
                          style={{
                            top: `${startPosition}%`,
                            height: `${duration}%`,
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