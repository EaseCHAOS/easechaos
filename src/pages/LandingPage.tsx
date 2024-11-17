import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const departments = [
  { id: 'CE', name: 'Computer Engineering' },
  { id: 'MN', name: 'Mining Engineering' },
  { id: 'ME', name: 'Mechanical Engineering' },
];

const years = [1, 2, 3, 4];

export default function LandingPage() {
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const navigate = useNavigate();

  const handleViewSchedule = () => {
    if (selectedDept && selectedYear) {
      navigate(`/timetable/${selectedDept}/${selectedYear}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 md:p-6">
      <div className="max-w-3xl w-full text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <a 
            href="https://github.com/Easechaos/easechaos" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center border border-gray-300 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition-colors duration-200"
          >
            Star us on GitHub <span className="ml-2">→</span>
          </a>
          <div className="flex flex-row justify-center items-center p-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              EaseCHAOS
          </h1>
          <img src={"/assets/easechaos.png"} alt="EaseCHAOS" className="w-24 h-24"  />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Streamline your academic experience with effortless schedule management, 
            intuitive viewing, and seamless department integration.
          </p>
          {/* <button
            onClick={handleViewSchedule}
            disabled={!selectedDept || !selectedYear}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <span className="mr-2">✨</span> Get Started
          </button> */}
        </div>

        {/* Selector Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 max-w-md mx-auto">
          <div className="space-y-4">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleViewSchedule}
            disabled={!selectedDept || !selectedYear}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 
                     disabled:bg-gray-400 disabled:cursor-not-allowed
                     transition-colors duration-200"
          >
            View Schedule
          </button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Quick Access</h3>
            <p className="text-gray-600">Instantly view your class schedule with just two selections</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Weekly Overview</h3>
            <p className="text-gray-600">See your entire week at a glance with our intuitive calendar view</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Mobile Friendly</h3>
            <p className="text-gray-600">Access your schedule on any device, anywhere</p>
          </div>
        </div>
      </div>
    </div>
  );
} 