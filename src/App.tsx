import React, { useEffect, useState } from 'react';
import Calendar from './components/Calendar';
import { WeekSchedule } from './types';

function App() {
  const [schedule, setSchedule] = useState<WeekSchedule>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/get_time_table', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'Draft_2',
        class_pattern: 'CE 3'
      })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        setSchedule(data);
        setLoading(false);
      })
      .catch(() => {
        setError('API not available');
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