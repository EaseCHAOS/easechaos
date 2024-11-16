import React from 'react';
import { DaySchedule } from '../types';
import clsx from 'clsx';

interface WeekViewProps {
  schedule?: DaySchedule;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

export default function WeekView({ schedule }: WeekViewProps) {
  if (!schedule) {
    return (
      <div className="flex items-center justify-center h-[900px] text-gray-500">
        No schedule available for this day
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[100px_1fr] gap-4 h-[900px] min-h-[900px] overflow-visible">
      {/* Time labels */}
      <div className="relative h-full md:mt-[5px]">
        {timeSlots.map((hour) => (
          <div
            key={hour}
            className="absolute text-sm text-gray-500"
            style={{
              top: `${((hour - 7) / 12) * 100}%`,
              right: '1rem',
              transform: 'translateY(-50%)'
            }}
          >
            {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
          </div>
        ))}
      </div>

      {/* Schedule grid */}
      <div className="relative border-l border-gray-200">
        {/* Time slot lines */}
        <div className="absolute inset-0">
          {timeSlots.map((hour) => (
            <div
              key={hour}
              className="absolute w-full border-t border-gray-200"
              style={{ top: `${((hour - 7) / 12) * 100}%` }}
            />
          ))}
        </div>

        {/* Events */}
        {schedule.data.map((slot, index) => {
          if (!slot.value) return null;

          const startHour = parseInt(slot.start.split(':')[0]);
          const startMinute = parseInt(slot.start.split(':')[1]);
          const endHour = parseInt(slot.end.split(':')[0]);
          const endMinute = parseInt(slot.end.split(':')[1]);

          const startPercentage = ((startHour - 7 + startMinute / 60) / 12) * 100;
          const duration = (endHour - startHour + (endMinute - startMinute) / 60) / 12 * 100;

          return (
            <div
              key={index}
              className={clsx(
                "absolute w-[calc(100%-1px)] ml-[1px] p-2 rounded-md",
                "bg-blue-100 border border-blue-200",
                "hover:bg-blue-200 transition-colors cursor-pointer"
              )}
              style={{
                top: `${startPercentage}%`,
                height: `${duration}%`,
                minHeight: '40px'
              }}
            >
              {/* <div className="text-sm font-medium text-blue-900">
                {slot.start} - {slot.end}
              </div> */}
              <div className="text-sm text-blue-700 line-clamp-2">
                {slot.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}