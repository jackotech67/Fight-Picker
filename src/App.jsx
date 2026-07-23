import './App.css'
import FighterCard from './FighterCard';
import AddFighterForm from './AddFighterForm';
import Navbar from './Navbar';
import { useState, useEffect } from 'react';

const weightClasses = [
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Light Heavyweight",
  "Heavyweight",
];

function App() {

  const [fighters, setFighters] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/fighters") // GET request to backend
    .then((response) => response.json()) // converts backend JSON response into JS object
    .then((data) => setFighters(data)); // data is now fighters array. updates react state
  }, []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submissions, setSubmissions] = useState("");
  const [knockouts, setKnockouts] = useState("");
  const [decisions, setDecisions] = useState("");

  const [weightClass, setWeightClass] = useState("");
  const [selectedWeightClass, setSelectedWeightClass] = useState("All");
  const filteredFighters = selectedWeightClass === "All"
    ? fighters
    : fighters.filter((fighter) => fighter.weightClass === selectedWeightClass);

  const [editingId, setEditingId] = useState(null);
  const [fighter1, setFighter1] = useState(null);
  const [fighter2, setFighter2] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");

  function addFighter() {

    // if editing an existing fighter, update it in the database
    if (editingId !== null){
      fetch(`http://localhost:3000/fighters/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        // send the updated fighter data to the backend
        body: JSON.stringify({
          firstName,
          lastName,
          weightClass,
          submissions,
          knockouts,
          decisions,
        }),
      })
      .then((response) => response.json())
      // replace the old fighter in state with updated version
      .then((updatedFighter) => {
        setFighters(
          fighters.map((fighter) => 
          fighter.id === editingId ? updatedFighter : fighter)
        );
        setEditingId(null);
      });
    }
    // otherwise create a new fighter
    else {
      fetch("http://localhost:3000/fighters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // send the new fighter data to the backend
        body: JSON.stringify({
          firstName, 
          lastName,
          weightClass,
          submissions,
          knockouts,
          decisions,
        }),
      })
      // add new fighter to state
      .then((response) => response.json())
      .then((newFighter) => {
        setFighters([...fighters, newFighter]);
      });    
    }
    // clear the form ready for the next entry
    setFirstName("");
    setLastName("");
    setWeightClass("");
    setSubmissions("");
    setKnockouts("");
    setDecisions("");
  }

  function deleteFighter(idToDelete) {

    // delete the fighter from the database
    fetch(`http://localhost:3000/fighters/${idToDelete}`, {
      method: "DELETE",
    })

    // remove the deleted fighter from state
    .then(() => {
      setFighters(
        fighters.filter((fighter) => fighter.id !== idToDelete)
      );
    });
  }

  function startEditing(fighter) {
    setFirstName(fighter.firstName);
    setLastName(fighter.lastName);
    setWeightClass(fighter.weightClass);
    setSubmissions(fighter.submissions);
    setKnockouts(fighter.knockouts);
    setDecisions(fighter.decisions);
    setEditingId(fighter.id);
  }

  function selectFighter(fighter) {
    if (fighter1 === null) {
      setFighter1(fighter);
    }
    else if (fighter1 === fighter) {
      return
    }
    else if (fighter2 === null) {
      setFighter2(fighter);
    }
  }

  function resetMatchup() {
    setFighter1(null);
    setFighter2(null);
    setShowComparison(false);
  }

  function unlockAdmin() {
    const code = prompt("Enter admin code");
    if (code === "password") {
      setIsAdmin(true);
      setAdminMessage("");
    }
    else {
      setAdminMessage("Access denied. Nice try Dana")
    }
  }

  function lockAdmin() {
    setIsAdmin(false);
  }

  return (
    <div>
      <Navbar 
        unlockAdmin={unlockAdmin}
        lockAdmin={lockAdmin}
        isAdmin={isAdmin}
      />
      <h1 className='title'>Fighter Picker</h1>
      
      <div className="add-fighter-wrapper">
        {isAdmin ? (
          <AddFighterForm
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            weightClass={weightClass}
            setWeightClass={setWeightClass}
            weightClasses={weightClasses}
            submissions={submissions}
            setSubmissions={setSubmissions}
            knockouts={knockouts}
            setKnockouts={setKnockouts}
            decisions={decisions}
            setDecisions={setDecisions}
            addFighter={addFighter}
            editingId={editingId} 
          />
        ) : (
          <p>
            Add Fighter: {adminMessage || "Admin access required"}
          </p>
        )}
      </div>

      <div className='comparison-wrapper'>
        <h2>Comparison</h2>
        <p>
          Fighter1: {fighter1 ? `${fighter1.firstName} ${fighter1.lastName}` : "None Selected"}
        </p>
        <p>
          Fighter2: {fighter2 ? `${fighter2.firstName} ${fighter2.lastName}` : "None Selected"}
        </p>
        <button onClick={() => setShowComparison(true)}>
          Compare
        </button>
        <button onClick={resetMatchup}>
          Reset
        </button>

        {showComparison && (
          fighter1 && fighter2 ? (
            <div>
              <h3>Match up</h3>
              <p>{fighter1.firstName} vs {fighter2.firstName}</p>
              <p>Subs: {fighter1.submissions} vs {fighter2.submissions}</p>
              <p>KOs: {fighter1.knockouts} vs {fighter2.knockouts}</p>
              <p>Decs: {fighter1.decisions} vs {fighter2.decisions}</p>
            </div>
          ) : (<p>Please select two fighters.</p>)
        )}

      </div> {/* comparison wrap */}

        <select 
          className='select-weight-class-button'
          value={selectedWeightClass}
          onChange={(e) => setSelectedWeightClass(e.target.value)}
        >
          <option value="All">All Weight Classes</option>
          {weightClasses.map((weightClass) => (
            <option key={weightClass} value={weightClass}>{weightClass}</option>
          ))}
        </select>
      <div className="fighter-list">
        {filteredFighters.map((fighter) => (
          <FighterCard 
            key={fighter.id} 
            fighter={fighter}
            deleteFighter={deleteFighter}
            startEditing={startEditing}
            selectFighter={selectFighter}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div> // return wrap
  );
}

export default App;
