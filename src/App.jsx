import { useState } from 'react'
import './App.css'
import FighterCard from './FighterCard';
import AddFighterForm from './AddFighterForm';
import Navbar from './Navbar';

function App() {

  const [fighters, setFighters] = useState([
    {
      id: crypto.randomUUID(),
      firstName: "Islam",
      lastName: "Makhachev",
      weightClass: "Lightweight",
      record: {
        submissions: 12,
        knockouts: 5,
        decisions: 10
      }
    },
    {
      id: crypto.randomUUID(),
      firstName: "Alexander",
      lastName: "Volkanovski",
      weightClass: "Featherweight",
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
    if (editingId !== null){
      setFighters(
        fighters.map((fighter) => {
          if (fighter.id === editingId) {
            return {
              ...fighter,
              firstName,
              lastName,
              weightClass,
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
      setEditingId(null);
    }
    else {
      setFighters([
        ...fighters,
        {
          id: crypto.randomUUID(),
          firstName,
          lastName,
          weightClass,
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
    setWeightClass("");
    setSubmissions("");
    setKnockouts("");
    setDecisions("");
  }

  function deleteFighter(idToDelete) {
    setFighters(fighters.filter((fighter) => fighter.id !== idToDelete));
  }

  function startEditing(fighter, index) {
    setFirstName(fighter.firstName);
    setLastName(fighter.lastName);
    setWeightClass(fighter.weightClass);
    setSubmissions(fighter.record.submissions);
    setKnockouts(fighter.record.knockouts);
    setDecisions(fighter.record.decisions);
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
              <p>Subs: {fighter1.record.submissions} vs {fighter2.record.submissions}</p>
              <p>KOs: {fighter1.record.knockouts} vs {fighter2.record.knockouts}</p>
              <p>Decs: {fighter1.record.decisions} vs {fighter2.record.decisions}</p>
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
          <option value="Flyweight">Flyweight</option>
          <option value="Bantamweight">Bantamweight</option>
          <option value="Featherweight">Featherweight</option>
          <option value="Lightweight">Lightweight</option>
          <option value="Welterweight">Welterweight</option>
          <option value="Middleweight">Middleweight</option>
          <option value="Light Heavyweight">Light Heavyweight</option>
          <option value="Heavyweight">Heavyweight</option>

        </select>
      <div className="fighter-list">
        {filteredFighters.map((fighter, index) => (
          <FighterCard 
            key={fighter.id} 
            fighter={fighter}
            index={index}
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
