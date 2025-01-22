import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Calendar from './components/Calendar';
import { Analytics } from "@vercel/analytics/react"
import { useEffect, useState } from 'react';

// Create a wrapper component to access useLocation
function AppContent() {
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(true);

  useEffect(() => {
    if (location.pathname !== '/') {
      localStorage.setItem('lastPath', location.pathname);
    }
  }, [location]);

  // Only check for redirect on initial render
  const lastPath = shouldRedirect ? localStorage.getItem('lastPath') : null;
  const isValidTimetablePath = lastPath?.startsWith('/timetable/');

  // Disable redirect after first render
  useEffect(() => {
    setShouldRedirect(false);
  }, []);

  return (
    <Routes>
      <Route path="/" element={
        isValidTimetablePath ? <Navigate to={lastPath!} replace /> : <LandingPage />
      } />
      <Route path="/timetable/:dept/:year" element={<Calendar />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <Analytics />
      <AppContent />
    </Router>
  );
}

export default App;