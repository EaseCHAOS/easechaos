import React, { useEffect, useState } from 'react';
import Calendar from './components/Calendar';
import { WeekSchedule } from './types';
import { mockSchedule } from './mockData';

function App() {
  const [schedule, setSchedule] = useState<WeekSchedule>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to fetch from API first
    fetch('api/v1/get_time_table')
      .then(response => {
        if (!response.ok) {
          throw new Error('API not available');
        }
        return response.json();
      })
      .then(data => {
        setSchedule(data);
        setLoading(false);
      })
      .catch(() => {
        // Silently fall back to mock data without showing error
        setSchedule(mockSchedule);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return <Calendar schedule={schedule} />;
}

export default App;