import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ExamPage from "./pages/ExamPage";
import Calendar from "./components/Calendar";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";

function AppContent() {
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(true);

  useEffect(() => {
    if (location.pathname !== "/") {
      localStorage.setItem("lastPath", location.pathname);
    }
  }, [location]);

  const lastPath = shouldRedirect ? localStorage.getItem("lastPath") : null;
  const isValidTimetablePath = lastPath?.startsWith("/timetable/");

  useEffect(() => {
    setShouldRedirect(false);
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isValidTimetablePath ? (
            <Navigate to={lastPath!} replace />
          ) : (
            <LandingPage />
          )
        }
      />
      <Route path="/timetable/:dept/:year" element={<Calendar />} />
      <Route path="/exam/:dept/:year" element={<ExamPage />} />
    </Routes>
  );
}

function App() {
  console.log("It is running");
  return (
    <Router>
      <Analytics />
      <AppContent />
    </Router>
  );
}

export default App;
