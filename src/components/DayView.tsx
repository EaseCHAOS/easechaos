import React from 'react';
import { DaySchedule } from '../types';
import clsx from 'clsx';

interface DayViewProps {
  schedule?: DaySchedule;
}

const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

interface PositionedEvent {
  start: string;
  end: string;
  value: string;
  startPosition: number;
  duration: number;
  isOverlapping?: boolean;
}

function convertTo24Hour(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (hours < 7) { // If hour is less than 7, it's PM
    return hours + 12 + (minutes || 0) / 60;
  }
  return hours + (minutes || 0) / 60;
}

export default function DayView({ schedule }: DayViewProps) {
  if (!schedule) {
    return (
      <div className="flex items-center justify-center h-[900px] text-gray-500">
        No schedule available for this day
      </div>
    );
  }

  // Process events to handle overlaps
  const processedEvents: PositionedEvent[] = schedule.data
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
    .sort((a, b) => a.startPosition - b.startPosition);

  // Check for overlaps
  processedEvents.forEach((event, index) => {
    const overlappingEvents = processedEvents.filter((otherEvent, otherIndex) => {
      if (otherIndex === index) return false;
      return !(
        otherEvent.startPosition >= (event.startPosition + event.duration) ||
        event.startPosition >= (otherEvent.startPosition + otherEvent.duration)
      );
    });
    event.isOverlapping = overlappingEvents.length > 0;
  });

  return (
    <div className="grid grid-cols-[100px_1fr] gap-4 h-[700px] overflow-y-auto relative py-2">
      {/* Time labels */}
      <div className="sticky left-0 h-full bg-white">
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

      {/* Schedule grid */}
      <div className="relative border-l border-gray-200 pt-2">
        {/* Time slot lines */}
        <div className="absolute inset-0 pt-2">
          {timeSlots.map((hour, index) => (
            <div
              key={hour}
              className="absolute w-full border-t border-gray-200"
              style={{ top: `${(index / (timeSlots.length - 1)) * 100}%` }}
            />
          ))}
        </div>

        {/* Events */}
        {processedEvents.map((event, index) => (
          <div
            key={index}
            className={clsx(
              "absolute p-2 rounded-md",
              "bg-blue-100 border border-blue-200",
              "hover:bg-blue-200 transition-colors cursor-pointer"
            )}
            style={{
              top: `${event.startPosition}%`,
              height: `${event.duration}%`,
              minHeight: '40px',
              left: event.isOverlapping ? '50%' : '0',
              width: event.isOverlapping ? 'calc(50% - 1px)' : 'calc(100% - 1px)',
              marginLeft: '1px'
            }}
          >
            <div className="text-sm text-blue-700 line-clamp-2">
              {event.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}