import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PredictionForm from './pages/PredictionForm.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx'; // New page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PredictionForm />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Routes>
    </Router>
  );
}

export default App;
