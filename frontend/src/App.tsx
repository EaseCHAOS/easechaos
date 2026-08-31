import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import LandingPage from "./pages/LandingPage";
import ExamPage from "./pages/ExamPage";
import HallSchedulePage from "./pages/HallSchedulePage";
import CelebrationPreviewPage from "./pages/CelebrationPreviewPage";
import Calendar from "./components/Calendar";
import AnnouncementBanner from "./components/AnnouncementBanner";
import SEO from "./components/SEO";
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
  const isValidSavedPath =
    lastPath?.startsWith("/timetable/") || lastPath?.startsWith("/exam/");

  useEffect(() => {
    setShouldRedirect(false);
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          isValidSavedPath ? (
            <Navigate to={lastPath!} replace />
          ) : (
            <LandingPage />
          )
        }
      />
      <Route path="/timetable/:dept/:year" element={<Calendar />} />
      <Route path="/exam/:dept/:year" element={<ExamPage />} />
      <Route path="/admin/halls" element={<HallSchedulePage />} />
      <Route path="/preview/celebration" element={<CelebrationPreviewPage />} />
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Analytics />
        <SEO />
        <AnnouncementBanner />
        <AppContent />
      </Router>
    </HelmetProvider>
  );
}

export default App;
