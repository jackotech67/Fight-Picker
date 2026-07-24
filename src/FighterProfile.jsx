import { useState, UseEffect, useEffect } from "react";
import { useParams } from "react-router-dom";

function FighterProfile() {
    const { id } = useParams();

    const [fighter, setFighter] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:3000/fighters/${id}`)
            .then((response) => response.json())
            .then((data) => setFighter(data));
    }, [id]);

    if (!fighter) {
        return <p>Loading...</p>;
    }

    return (
        <div className="fighter-profile">
            <div className="fighter-header">
                <h1>{fighter.firstName} {fighter.lastName}</h1>
                <h2>{fighter.weightClass}</h2>
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
                <h2>Fight record coming soon...</h2>
            </div>
        </div>
    );
}

export default FighterProfile;