import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Calendar from './components/Calendar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/timetable/:dept/:year" element={<Calendar />} />
      </Routes>
    </Router>
  );
}

export default App;