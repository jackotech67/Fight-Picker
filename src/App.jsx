import { Routes, Route } from "react-router-dom";
import FighterProfile from './FighterProfile';
import HomePage from './HomePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/fighter/:id" element={<FighterProfile />} />
    </Routes>
  );
}

export default App;
