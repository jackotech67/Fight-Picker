import { useState } from 'react'
import './App.css'
import FighterCard from './FighterCard';
import AddFighterForm from './AddFighterForm';
import Navbar from './Navbar';

function App() {

  const [fighters, setFighters] = useState([
    {
      firstName: "Islam",
      lastName: "Makhachev",
      record: {
        submissions: 12,
        knockouts: 5,
        decisions: 10
      }
    },
    {
      firstName: "Alexander",
      lastName: "Volkanovski",
      record: {
        submissions: 3,
        knockouts: 13,
        decisions: 12
      }
    }
  ]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submissions, setSubmissions] = useState("");
  const [knockouts, setKnockouts] = useState("");
  const [decisions, setDecisions] = useState("");

  const [editingIndex, setEditingIndex] = useState(null);
  const [fighter1, setFighter1] = useState(null);
  const [fighter2, setFighter2] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");

  function addFighter() {
    if (editingIndex !== null){
      setFighters(
        fighters.map((fighter, index) => {
          if (index === editingIndex) {
            return {
              firstName,
              lastName,
              record: {
                submissions,
                knockouts,
                decisions
              }
            };
          }
          return fighter;
        })
      )
    }
    else {
      setFighters([
        ...fighters,
        {
          firstName,
          lastName,
          record: {
            submissions, 
            knockouts,
            decisions
          }
        }
      ]);      
    }

    setFirstName("");
    setLastName("");
    setSubmissions("");
    setKnockouts("");
    setDecisions("");
  }

  function deleteFighter(indexToDelete) {
    setFighters(fighters.filter((fighter, index) => index !== indexToDelete));
  }

  function startEditing(fighter, index) {
    setFirstName(fighter.firstName);
    setLastName(fighter.lastName);
    setSubmissions(fighter.record.submissions);
    setKnockouts(fighter.record.knockouts);
    setDecisions(fighter.record.decisions);
    setEditingIndex(index)
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
      <h1>Fighter Picker</h1>
      {isAdmin ? (
        <AddFighterForm
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          submissions={submissions}
          setSubmissions={setSubmissions}
          knockouts={knockouts}
          setKnockouts={setKnockouts}
          decisions={decisions}
          setDecisions={setDecisions}
          addFighter={addFighter}
          editingIndex={editingIndex} 
        />
      ) : (
        <p>
          Add Fighter: {adminMessage || "Admin access required"}
        </p>
      )}

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
              <p>Subs: {fighter1.record.submissions} vs {fighter2.record.submissions}</p>
              <p>KOs: {fighter1.record.knockouts} vs {fighter2.record.knockouts}</p>
              <p>Decs: {fighter1.record.decisions} vs {fighter2.record.decisions}</p>
            </div>
          ) : (<p>Please select two fighters.</p>)
        )}

      </div> {/* comparison wrap */}

      {fighters.map((fighter, index) => (
        <FighterCard 
          key={index} 
          fighter={fighter}
          index={index}
          deleteFighter={deleteFighter}
          startEditing={startEditing}
          selectFighter={selectFighter}
          isAdmin={isAdmin}
        />
      ))}

      
      
    </div> // return wrap
  );
}

export default App;
