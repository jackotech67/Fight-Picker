import { useState, UseEffect, useEffect } from "react";
import { data, useParams } from "react-router-dom";

function FighterProfile() {
    const { id } = useParams();

    const [fighter, setFighter] = useState(null);

    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3000/fighters/${id}`)
            .then((response) => response.json())
            .then((data) => setFighter(data));
        
        fetch(`http://localhost:3000/fighters/${id}/history`)
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
                    <p>Height: {fighter.height} cm</p>
                    <p>Reach: {fighter.reach}"</p>
                    <p>Stance: {fighter.stance}</p>
                    <p>Age: {fighter.age}</p>
                </div>
                <div className="fighter-stats">
                    <h2>Advanced stats</h2>
                    <p>Strikes per min: {fighter.strikes_per_min}</p>
                    <p>Striking accuracy: {fighter.striking_accuracy}%</p>
                    <p>Strikes absorbed per min: {fighter.strikes_absorbed_per_min}</p>
                    <p>Striking defence: {fighter.striking_defence}%</p>
                    <p>Takedowns per 15 min: {fighter.takedowns_per_15_min}</p>
                    <p>Takedown accuracy: {fighter.takedown_accuracy}%</p>
                    <p>Takedown defence: {fighter.takedown_defence}%</p>
                    <p>Submissions per 15 min: {fighter.submissions_per_15_min}</p>
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
                            <tr key={fight.fight_id}>
                                <td>{fight.is_winner ? "W" : "L"}</td>
                                <td>{fight.name}</td>
                                <td>{fight.method}</td>
                                <td>{fight.round}</td>
                                <td>{fight.time}</td>
                                <td>{fight.knockdowns}</td>
                                <td>{fight.strikes}</td>
                                <td>{fight.takedowns}</td>
                                <td>{fight.submissions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FighterProfile;