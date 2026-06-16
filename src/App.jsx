import { useState } from 'react'
import './App.css'
import FighterCard from './fighterCard';
import AddFighterForm from './AddFighterForm';

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

    setEditingIndex(null);
    setEditingFighter(null);

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
    setEditingFighter(fighter);

    setFirstName(fighter.firstName);
    setLastName(fighter.lastName);
    setSubmissions(fighter.record.submissions);
    setKnockouts(fighter.record.knockouts);
    setDecisions(fighter.record.decisions);
    setEditingIndex(index)
  }

  return (
    <div>
      <h1>Fighter Picker</h1>
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

      {fighters.map((fighter, index) => (
        <FighterCard 
          key={index} 
          fighter={fighter}
          index={index}
          deleteFighter={deleteFighter}
          startEditing={startEditing}
        />
      ))}
      
    </div>
  );
}

export default App;
