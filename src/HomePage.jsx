import './App.css'
import FighterCard from './FighterCard';
import Navbar from './Navbar';
import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const weightClasses = [
    "Flyweight",
    "Women's Flyweight",
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
    const [upcomingFighters, setUpcomingFighters] = useState([]);
    const comparisonRef = useRef(null);

    useEffect(() => {
        fetch(`${API_URL}/fighters`) 
        .then((response) => response.json()) 
        .then((data) => setFighters(data)); 
        fetch(`${API_URL}/fighters/upcoming`)
        .then((response) => response.json())
        .then((data) => setUpcomingFighters(data));
    }, []);

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

    
    const [selectedWeightClass, setSelectedWeightClass] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredFighters = fighters.filter((fighter) => {
        const matchesWeightClass =
            selectedWeightClass === "" ||
            fighter.weightClass === selectedWeightClass;

        const fullName = `${fighter.firstName} ${fighter.lastName}`.toLowerCase();

        const matchesSearch =
            fullName.includes(searchTerm.toLowerCase());

        return matchesWeightClass && matchesSearch;
    });

    const displayedFighters =
        selectedWeightClass === "" && searchTerm === ""
            ? upcomingFighters
            : filteredFighters;

    const [fighter1, setFighter1] = useState(null);
    const [fighter2, setFighter2] = useState(null);
    const [showComparison, setShowComparison] = useState(false);

    const [isAdmin, setIsAdmin] = useState(
        () => sessionStorage.getItem("adminToken") !== null
    );
    const [adminMessage, setAdminMessage] = useState("");

    const [highlightStats, setHighlightStats] = useState(false);

    function deleteFighter(idToDelete) {

        fetch(`${API_URL}/fighters/${idToDelete}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}`
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to delete fighter");
            }
            setFighters(
                fighters.filter((fighter) => fighter.id !== idToDelete)
            );
        });
    }

    function selectFighter(fighter) {
        const fullFighter = fighters.find(
            (fullFighter) => fullFighter.id === fighter.id
        );

        if (fighter1 === null) {
            setFighter1(fullFighter);
        }
        else if (fighter1.id === fighter.id) {
            return;
        }
        else if (fighter2 === null) {
            setFighter2(fullFighter);

            comparisonRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }
    }

    function resetMatchup() {
        setFighter1(null);
        setFighter2(null);
        setShowComparison(false);
    }

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
            setAdminMessage("");
        } else {
            setAdminMessage("Invalid password")
        }
    }

    function lockAdmin() {
        sessionStorage.removeItem("adminToken");
        setIsAdmin(false);
        setAdminMessage("");
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
    function getLoser(value1, value2) { {/* for inputs where higher value is bad */}
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
    } 

    return (
        <div>
            <Navbar 
                unlockAdmin={unlockAdmin}
                lockAdmin={lockAdmin}
                isAdmin={isAdmin}
            />
            <h1 className='title'>Fighter Picker</h1> 

            <div className='comparison-wrapper' ref={comparisonRef}>
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
                                    <td className={getWinner(fighter1.strikesPerMin, fighter2.strikesPerMin)}>
                                        {fighter1.strikesPerMin}
                                    </td>
                                    <td>Strikes per min</td>
                                    <td className={getWinner(fighter2.strikesPerMin, fighter1.strikesPerMin)}>
                                        {fighter2.strikesPerMin}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.strikingAccuracy, fighter2.strikingAccuracy)}>
                                        {fighter1.strikingAccuracy}
                                    </td>
                                    <td>Striking accuracy %</td>
                                    <td className={getWinner(fighter2.strikingAccuracy, fighter1.strikingAccuracy)}>
                                        {fighter2.strikingAccuracy}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getLoser(fighter1.strikesAbsorbedPerMin, fighter2.strikesAbsorbedPerMin)}>
                                        {fighter1.strikesAbsorbedPerMin}
                                    </td>
                                    <td>Strikes absorbed per min</td>
                                    <td className={getLoser(fighter2.strikesAbsorbedPerMin, fighter1.strikesAbsorbedPerMin)}>
                                        {fighter2.strikesAbsorbedPerMin}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.strikingDefence, fighter2.strikingDefence)}>
                                        {fighter1.strikingDefence}
                                    </td>
                                    <td>Striking defence %</td>
                                    <td className={getWinner(fighter2.strikingDefence, fighter1.strikingDefence)}>
                                        {fighter2.strikingDefence}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.takedownsPer15Min, fighter2.takedownsPer15Min)}>
                                        {fighter1.takedownsPer15Min}
                                    </td>
                                    <td>Takedowns per 15 min</td>
                                    <td className={getWinner(fighter2.takedownsPer15Min, fighter1.takedownsPer15Min)}>
                                        {fighter2.takedownsPer15Min}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.takedownAccuracy, fighter2.takedownAccuracy)}>
                                        {fighter1.takedownAccuracy}
                                    </td>
                                    <td>Takedown accuracy %</td>
                                    <td className={getWinner(fighter2.takedownAccuracy, fighter1.takedownAccuracy)}>
                                        {fighter2.takedownAccuracy}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.takedownDefence, fighter2.takedownDefence)}>
                                        {fighter1.takedownDefence}
                                    </td>
                                    <td>Takedown defence %</td>
                                    <td className={getWinner(fighter2.takedownDefence, fighter1.takedownDefence)}>
                                        {fighter2.takedownDefence}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.submissionsPer15Min, fighter2.submissionsPer15Min)}>
                                        {fighter1.submissionsPer15Min}
                                    </td>
                                    <td>Submissions per 15 min</td>
                                    <td className={getWinner(fighter2.submissionsPer15Min, fighter1.submissionsPer15Min)}>
                                        {fighter2.submissionsPer15Min}
                                    </td>
                                </tr>
                                {/* Career */}
                                <tr>
                                    <th colSpan={3}>Career</th>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.submissionWins, fighter2.submissionWins)}>
                                        {fighter1.submissionWins}
                                    </td>
                                    <td>Submissions</td>
                                    <td className={getWinner(fighter2.submissionWins, fighter1.submissionWins)}>
                                        {fighter2.submissionWins}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.knockoutWins, fighter2.knockoutWins)}>
                                        {fighter1.knockoutWins}
                                    </td>
                                    <td>Knockouts</td>
                                    <td className={getWinner(fighter2.knockoutWins, fighter1.knockoutWins)}>
                                        {fighter2.knockoutWins}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.decisionWins, fighter2.decisionWins)}>
                                        {fighter1.decisionWins}
                                    </td>
                                    <td>Decisions</td>
                                    <td className={getWinner(fighter2.decisionWins, fighter1.decisionWins)}>
                                        {fighter2.decisionWins}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (<p>Please select two fighters.</p>)
                )}

            </div> {/* comparison wrap */}
                <input
                    type="text"
                    className="fighter-search"
                    placeholder="Search fighters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                className='select-weight-class-button'
                value={selectedWeightClass}
                onChange={(e) => setSelectedWeightClass(e.target.value)}
                >
                <option value="">Next Event</option>
                {weightClasses.map((weightClass) => (
                    <option key={weightClass} value={weightClass}>{weightClass}</option>
                ))}
                </select>
            <div className="fighter-list">
                {displayedFighters.map((fighter) => (
                <FighterCard 
                    key={fighter.id} 
                    fighter={fighter}
                    deleteFighter={deleteFighter}
                    selectFighter={selectFighter}
                    isAdmin={isAdmin}
                    selection={
                        fighter.id === fighter1?.id ? "fighter-1" :
                        fighter.id === fighter2?.id ? "fighter-2" :
                        ""
                    }
                />
                ))}
            </div>
        </div> 
    );
}

export default HomePage;