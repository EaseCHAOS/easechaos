import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, Calendar as CalendarDayIcon, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { WeekSchedule } from '../types';
import WeekView from './WeekView';
import DayView from './DayView';
import 'react-day-picker/dist/style.css';
import { useParams } from 'react-router-dom';
import { downloadElementAsImage, downloadElementAsPDF } from '../utils/downloadUtils';

// interface CalendarProps {
//   schedule: WeekSchedule;
// }

type ViewMode = 'day' | 'week';

export default function Calendar() {
  const [schedule, setSchedule] = useState<WeekSchedule>([]);
  const [error, setError] = useState<string | null>(null);
  const { dept, year } = useParams();

  useEffect(() => {
    setError(null);
    
    if (!dept || !year) {
      setError('Missing department or year');
      return;
    }

    fetch(import.meta.env.VITE_API_URL + '/get_time_table', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'Draft_2',
        class_pattern: `${dept} ${year}`
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }
        return response.json();
      })
      .then(data => {
        setSchedule(data);
      })
      .catch((err) => {
        setError(err.message || 'API not available');
      });
  }, [dept, year]); // Dependencies array includes dept and year

 

  // Show error state if there's an error
  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
  }

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(event.target as Node)) {
        setShowDownloadDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (viewMode !== 'day') return;

      if (event.key === 'ArrowLeft' && selectedDate.getDay() !== 1) {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
      }

      if (event.key === 'ArrowRight' && selectedDate.getDay() !== 5) {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewMode, selectedDate]);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const currentDaySchedule = schedule.find(day => day.day === dayNames[selectedDate.getDay() - 1]);

  const getWeekDates = () => {
    const monday = new Date(selectedDate);
    while (monday.getDay() !== 1) {
      monday.setDate(monday.getDate() - 1);
    }
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);

    return `${format(monday, 'MMM d')} - ${format(friday, 'MMM d, yyyy')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className={clsx(
        "h-full my-auto mx-auto",
        viewMode === 'week' ? "max-w-12xl" : "max-w-4xl"
      )}>
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
                <a 
                  href="/"
                  className="border-2 border-[#1B1B1B] p-2 rounded-md hover:bg-gray-100 mr-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </a>
                <h1 className="text-2xl font-bold text-center sm:text-left">
                  {viewMode === 'week'
                    ? "Week's Schedule"
                    : format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      ? "Today"
                      : format(selectedDate, 'EEEE')}
                </h1>
                {viewMode === 'day' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
                    >
                      <CalendarIcon className="w-5 h-5" />
                      <span>{format(selectedDate, 'MMM d, yyyy')}</span>
                    </button>
                    {showDatePicker && (
                      <div 
                        ref={datePickerRef} 
                        className="absolute left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 top-full mt-2 bg-white rounded-lg shadow-lg z-[1100]"
                      >
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
                )}
              </div>
              
              <div className="flex items-center justify-center w-full sm:w-auto gap-4">
                {viewMode === 'week' && (
                  <div className='relative'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>Download</span>
                      <button
                        onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                        className="p-1 rounded-full border-2 border-gray-600 flex items-center"
                      >
                        <svg className='w-2 h-2' data-slot="icon" fill="none" strokeWidth="4" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"></path>
                        </svg>
                      </button>
                    </div>
                    {showDownloadDropdown && (
                      <div ref={downloadDropdownRef} className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-[1100] py-1">
                        <button
                          onClick={() => {
                            downloadElementAsPDF('week-schedule', 'Schedule.pdf');
                            setShowDownloadDropdown(false);
                          }}
                          className="w-full px-4 py-1 text-left hover:bg-gray-100 border-b border-gray-200"
                        >
                          <span className='text-sm'>PDF</span>
                        </button>
                        <button
                          onClick={() => {
                            downloadElementAsImage('week-schedule', 'Schedule.png');
                            setShowDownloadDropdown(false);
                          }}
                          className="w-full px-4 py-1 text-left hover:bg-gray-100"
                        >
                          <span className='text-sm'>Image</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('week')}
                    className={clsx(
                      "p-2 rounded-md",
                      viewMode === 'week' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    )}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('day')}
                    className={clsx(
                      "p-2 rounded-md",
                      viewMode === 'day' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    )}
                  >
                    <CalendarDayIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {viewMode === 'day' && (
                  <div className="flex items-center space-x-2 shrink-0">
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
                )}
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-auto max-9xl px-4">
            {viewMode === 'week' ? (
              <WeekView schedule={schedule} />
            ) : (
              <DayView schedule={currentDaySchedule} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}