import { Routes, Route } from "react-router-dom";
import FighterProfile from './pages/FighterProfile';
import HomePage from './pages/HomePage';
import AddFighterPage from './pages/AddFighterPage';
import EditFighterPage from './pages/EditFighterPage';
import BoutProfile from "./pages/BoutProfile";
import FighterLibrary from "./pages/FighterLibrary";
import EventsPage from "./pages/EventsPage";
import EventProfile from "./pages/EventProfile";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {

  const [isAdmin, setIsAdmin] = useState(
        () => sessionStorage.getItem("adminToken") !== null
    );

  useEffect(() => {
      const token = sessionStorage.getItem("adminToken");

      if (!token) return;

      fetch(`${API_URL}/admin/check`, {
          headers: {
              "Authorization": `Bearer ${token}`
          }
      })
      .then((response) => {
          if (!response.ok) {
              sessionStorage.removeItem("adminToken");
              setIsAdmin(false);
          }
      });
  }, []);

  async function unlockAdmin(){
      const password = prompt("Enter admin password");

      if (password == null) {
          return;
      }

      const response = await fetch(`${API_URL}/admin/login`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ password })
      });
      const data = await response.json();
      
      if (response.ok) {
          sessionStorage.setItem("adminToken", data.token);
          setIsAdmin(true);
      } else {
          alert("Invalid password")
      }
  }

  function lockAdmin() {
      sessionStorage.removeItem("adminToken");
      setIsAdmin(false);
  }


  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <HomePage 
            isAdmin={isAdmin} 
            unlockAdmin={unlockAdmin}
            lockAdmin={lockAdmin}
          />
        } 
      />
      <Route path="/fighter/:id" element={<FighterProfile />} />
      <Route path="/fighters/new" element={<AddFighterPage />} />
      <Route path="/fighters/:id/edit" element={<EditFighterPage />} />
      <Route path="/bouts/:id" element={<BoutProfile />} />
      <Route 
        path="/fighters" 
        element={
          <FighterLibrary 
            isAdmin={isAdmin} 
            unlockAdmin={unlockAdmin} 
            lockAdmin={lockAdmin}
          />
        } 
      />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventProfile />} />
    </Routes>
  );
}

export default App;
