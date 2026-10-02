import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function formatHeight(inches) {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;

    return `${feet}' ${remainingInches}"`;
}

function FighterProfile() {
    const { id } = useParams();

    const [fighter, setFighter] = useState(null);

    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/fighters/${id}`)
            .then((response) => response.json())
            .then((data) => setFighter(data));
        
        fetch(`${API_URL}/fighters/${id}/history`)
            .then((response) => response.json())
            .then((data) => setHistory(data));
    }, [id]);

    if (!fighter) {
        return <p>Loading...</p>;
    }

    return (
        <div className="fighter-profile">
            <div className="fighter-header">
                <div>
                    <h1>{fighter.firstName} {fighter.lastName}</h1>
                    <h2>{fighter.weightClass}</h2>
                </div>
                <h2>{fighter.careerWins} - {fighter.careerLosses} - {fighter.careerDraws}</h2>
            </div>
            <div className="fighter-content-wrap">
                <div className="fighter-summary">
                    <h2>Profile</h2>
                    <p>Height: {formatHeight(fighter.height)}</p>
                    <p>Reach: {fighter.reach}"</p>
                    <p>Stance: {fighter.stance}</p>
                    <p>Age: {fighter.age}</p>
                </div>
                <div className="fighter-stats">
                    <h2>Advanced stats</h2>
                    <p>Strikes per min: {fighter.strikesPerMin}</p>
                    <p>Striking accuracy: {fighter.strikingAccuracy}%</p>
                    <p>Strikes absorbed per min: {fighter.strikesAbsorbedPerMin}</p>
                    <p>Striking defence: {fighter.strikingDefence}%</p>
                    <p>Takedowns per 15 min: {fighter.takedownsPer15Min}</p>
                    <p>Takedown accuracy: {fighter.takedownAccuracy}%</p>
                    <p>Takedown defence: {fighter.takedownDefence}%</p>
                    <p>Submissions per 15 min: {fighter.submissionsPer15Min}</p>
                </div>
                <div className="fighter-notes">
                    <h2>Notes</h2>
                </div>
            </div>
            <div className="fighter-history">
                <h2>Fight history</h2>

                <table className="fight-history-table">
                    <thead>
                        <tr>
                            <th>Result</th>
                            <th>Opponent</th>
                            <th>Event</th>
                            <th>Method</th>
                            <th>Round</th>
                            <th>Time</th>
                            <th>KD</th>
                            <th>Str</th>
                            <th>TD</th>
                            <th>Sub</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((fight) => (
                            <tr key={fight.boutId}>
                                <td>
                                    {
                                    fight.outcome === "win" ? "W" : 
                                    fight.outcome === "loss" ? "L" :
                                    "-"
                                    } 
                                </td>
                                <td>{fight.opponentFirstName} {fight.opponentLastName}</td>
                                <td>
                                    <Link to={`/bouts/${fight.boutId}`}>
                                        {fight.name}
                                    </Link>
                                </td>
                                <td>{fight.method}</td>
                                <td>{fight.resultRound}</td>
                                <td>{fight.resultTime}</td>
                                <td>{fight.knockdowns}</td>
                                <td>{fight.totalStrikesLanded}</td>
                                <td>{fight.takedownsLanded}</td>
                                <td>{fight.submissionAttempts}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FighterProfile;