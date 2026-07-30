import { Routes, Route } from "react-router-dom";
import FighterProfile from './FighterProfile';
import HomePage from './HomePage';
import AddFighterPage from './AddFighterPage';
import EditFighterPage from './EditFighterPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/fighter/:id" element={<FighterProfile />} />
      <Route path="/fighters/new" element={<AddFighterPage />} />
      <Route path='/fighters/:id/edit' element={<EditFighterPage />} />
    </Routes>
  );
}

export default App;
