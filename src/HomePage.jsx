import './App.css'
import FighterCard from './FighterCard';
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

function HomePage() {

    const [fighters, setFighters] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/fighters") // GET request to backend
        .then((response) => response.json()) // converts backend JSON response into JS object
        .then((data) => setFighters(data)); // data is now fighters array. updates react state
    }, []);

    
    const [selectedWeightClass, setSelectedWeightClass] = useState("All");
    const filteredFighters = selectedWeightClass === "All"
        ? fighters
        : fighters.filter((fighter) => fighter.weightClass === selectedWeightClass);

    const [fighter1, setFighter1] = useState(null);
    const [fighter2, setFighter2] = useState(null);
    const [showComparison, setShowComparison] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);
    const [adminMessage, setAdminMessage] = useState("");

    const [highlightStats, setHighlightStats] = useState(false);

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

    function getWinner(value1, value2) {
        let className = "";
        if (highlightStats === false) {
            return "";
        }
        if (value1 > value2) {
            className = "winner";
        }
        else if (value1 < value2) {
            className = "loser"
        }
        return className;
    }
    function getLoser(value1, value2) { 
        let className = "";
        if (highlightStats === false) {
            return "";
        }
        if (value1 > value2) {
            className = "loser";
        }
        else if (value1 < value2) {
            className = "winner";
        }
        return className;
    } {/* for inputs where higher value is bad */}

    return (
        <div>
            <Navbar 
                unlockAdmin={unlockAdmin}
                lockAdmin={lockAdmin}
                isAdmin={isAdmin}
            />
            <h1 className='title'>Fighter Picker</h1> 

            <div className='comparison-wrapper'>
                <h2>Comparison</h2>
                <p>
                    Fighter1: {fighter1 ? `${fighter1.firstName} ${fighter1.lastName}` : "None Selected"}
                </p>
                <p>
                    Fighter2: {fighter2 ? `${fighter2.firstName} ${fighter2.lastName}` : "None Selected"}
                </p>
                <div className="comparison-controls">
                    <div className="comparison-buttons">
                        <button onClick={() => setShowComparison(true)}>Compare</button>
                        <button onClick={resetMatchup}>Reset</button>
                    </div>
                    <button onClick={() => setHighlightStats(!highlightStats)}>
                        {highlightStats ? "Hide Highlights" : "Highlight Stats"}
                    </button>
                </div>
                
                {showComparison && (
                fighter1 && fighter2 ? (
                    <div className='comparison-table'>
                        <table className='comparison-table-content'>
                            <thead>
                                <tr>
                                    <th>{fighter1.firstName}</th>
                                    <th>Stat</th>
                                    <th>{fighter2.firstName}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* General */}
                                <tr>
                                    <th colSpan={3}>General</th>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.height, fighter2.height)}>
                                        {fighter1.height}
                                    </td>
                                    <td>Height</td>
                                    <td className={getWinner(fighter2.height, fighter1.height)}>
                                        {fighter2.height}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.reach, fighter2.reach)}>
                                        {fighter1.reach}
                                    </td>
                                    <td>Reach</td>
                                    <td className={getWinner(fighter2.reach, fighter1.reach)}>
                                        {fighter2.reach}
                                    </td>
                                </tr>
                                <tr>
                                    <td>{fighter1.stance}</td>
                                    <td>Stance</td>
                                    <td>{fighter2.stance}</td>
                                </tr>
                                <tr>
                                    <td className={getLoser(fighter1.age, fighter2.age)}>
                                        {fighter1.age}
                                    </td>
                                    <td>Age</td>
                                    <td className={getLoser(fighter2.age, fighter1.age)}>
                                        {fighter2.age}
                                    </td>
                                </tr>
                                {/* Advanced */}
                                <tr>
                                    <th colSpan={3}>Advanced</th>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.strikes_per_min, fighter2.strikes_per_min)}>
                                        {fighter1.strikes_per_min}
                                    </td>
                                    <td>Strikes per min</td>
                                    <td className={getWinner(fighter2.strikes_per_min, fighter1.strikes_per_min)}>
                                        {fighter2.strikes_per_min}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.striking_accuracy, fighter2.striking_accuracy)}>
                                        {fighter1.striking_accuracy}
                                    </td>
                                    <td>Striking accuracy %</td>
                                    <td className={getWinner(fighter2.striking_accuracy, fighter1.striking_accuracy)}>
                                        {fighter2.striking_accuracy}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getLoser(fighter1.strikes_absorbed_per_min, fighter2.strikes_absorbed_per_min)}>
                                        {fighter1.strikes_absorbed_per_min}
                                    </td>
                                    <td>Strikes absorbed per min</td>
                                    <td className={getLoser(fighter2.strikes_absorbed_per_min, fighter1.strikes_absorbed_per_min)}>
                                        {fighter2.strikes_absorbed_per_min}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.striking_defence, fighter2.striking_defence)}>
                                        {fighter1.striking_defence}
                                    </td>
                                    <td>Striking defence %</td>
                                    <td className={getWinner(fighter2.striking_defence, fighter1.striking_defence)}>
                                        {fighter2.striking_defence}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.takedowns_per_15_min, fighter2.takedowns_per_15_min)}>
                                        {fighter1.takedowns_per_15_min}
                                    </td>
                                    <td>Takedowns per 15 min</td>
                                    <td className={getWinner(fighter2.takedowns_per_15_min, fighter1.takedowns_per_15_min)}>
                                        {fighter2.takedowns_per_15_min}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.takedown_accuracy, fighter2.takedown_accuracy)}>
                                        {fighter1.takedown_accuracy}
                                    </td>
                                    <td>Takedown accuracy %</td>
                                    <td className={getWinner(fighter2.takedown_accuracy, fighter1.takedown_accuracy)}>
                                        {fighter2.takedown_accuracy}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.takedown_defence, fighter2.takedown_defence)}>
                                        {fighter1.takedown_defence}
                                    </td>
                                    <td>Takedown defence %</td>
                                    <td className={getWinner(fighter2.takedown_defence, fighter1.takedown_defence)}>
                                        {fighter2.takedown_defence}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.submissions_per_15_min, fighter2.submissions_per_15_min)}>
                                        {fighter1.submissions_per_15_min}
                                    </td>
                                    <td>Submissions per 15 min</td>
                                    <td className={getWinner(fighter2.submissions_per_15_min, fighter1.submissions_per_15_min)}>
                                        {fighter2.submissions_per_15_min}
                                    </td>
                                </tr>

                                {/* Career */}
                                <tr>
                                    <th colSpan={3}>Career</th>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.submissions, fighter2.submissions)}>
                                        {fighter1.submissions}
                                    </td>
                                    <td>Submissions</td>
                                    <td className={getWinner(fighter2.submissions, fighter1.submissions)}>
                                        {fighter2.submissions}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.knockouts, fighter2.knockouts)}>
                                        {fighter1.knockouts}
                                    </td>
                                    <td>Knockouts</td>
                                    <td className={getWinner(fighter2.knockouts, fighter1.knockouts)}>
                                        {fighter2.knockouts}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.decisions, fighter2.decisions)}>
                                        {fighter1.decisions}
                                    </td>
                                    <td>Decisions</td>
                                    <td className={getWinner(fighter2.decisions, fighter1.decisions)}>
                                        {fighter2.decisions}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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
                    selectFighter={selectFighter}
                    isAdmin={isAdmin}
                />
                ))}
            </div>
        </div> 
    );
}

export default HomePage;