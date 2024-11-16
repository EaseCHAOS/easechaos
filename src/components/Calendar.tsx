import React, { useState } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { WeekSchedule } from '../types';
import WeekView from './WeekView';
import 'react-day-picker/dist/style.css';

interface CalendarProps {
  schedule: WeekSchedule;
}

export default function Calendar({ schedule }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const currentDaySchedule = schedule.find(day => day.day === dayNames[selectedDate.getDay() - 1]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Schedule</h1>
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <CalendarIcon className="w-5 h-5" />
                  <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
                </button>
                {showDatePicker && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 bg-white rounded-lg shadow-lg z-50">
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
                        disabled: (date) => date.getDay() === 0 || date.getDay() === 6,
                      }}
                      showOutsideDays
                      className="p-3"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 rounded-md hover:bg-gray-100"
                disabled={selectedDate.getDay() === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 rounded-md hover:bg-gray-100"
                disabled={selectedDate.getDay() === 5}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            <WeekView schedule={currentDaySchedule} />
          </div>
        </div>
      </div>
    </div>
  );
}