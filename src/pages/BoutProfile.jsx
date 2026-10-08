import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-NZ", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function getHighlightClass(value1, value2, highlightStats) {
    if (!highlightStats) return "";

    if (value1 > value2) return "winner";
    if (value1 < value2) return "loser";
    return "";
}

function BoutProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bout, setBout] = useState(null);
    const [highlightStats, setHighlightStats] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/bouts/${id}`)
            .then((response) => response.json())
            .then((data) => setBout(data));
    }, [id]);

    if (!bout) {
        return <p>Loadings...</p>;
    }

    const fighter1 = bout.fighters[0];
    const fighter2 = bout.fighters[1];

    const fighter1Rounds = bout.rounds.filter(
        (round) => round.fighterId === fighter1.id
    );
    const fighter2Rounds = bout.rounds.filter(
        (round) => round.fighterId === fighter2.id
    );

    return (
        <>  
            <div className="bout-profile">
                <button onClick={() => navigate(-1)} className="back-button">
                    ← Back
                </button>
                <h1>{bout.fighters[0].firstName} {bout.fighters[0].lastName} vs {bout.fighters[1].firstName} {bout.fighters[1].lastName}</h1>
                <p>{bout.eventName}</p>
                <p>{formatDate(bout.eventDate)}</p>
                <p>{bout.method} - Round {bout.resultRound} - {bout.resultTime}</p>
                <button onClick={() => setHighlightStats(!highlightStats)}>
                    Highlight Stats
                </button>

                <div className="bout-fighter-header">
                    <h2>{fighter1.firstName} {fighter1.lastName}</h2>
                    <h2>{fighter2.firstName} {fighter2.lastName}</h2>
                </div>

                {fighter1Rounds.map((round, index) => (
                    <div key={round.round}>
                        <h2>Round {round.round}</h2>
                        <table className="round-comparison-table">
                            <tbody>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.significantStrikesLanded,
                                        fighter2Rounds[index].significantStrikesLanded,
                                        highlightStats
                                    )}>
                                        {round.significantStrikesLanded}/{round.significantStrikesAttempted}
                                    </td>
                                    <td>Significant Strikes</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].significantStrikesLanded,
                                        round.significantStrikesLanded,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].significantStrikesLanded}/{fighter2Rounds[index].significantStrikesAttempted}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.totalStrikesLanded,
                                        fighter2Rounds[index].totalStrikesLanded,
                                        highlightStats
                                    )}>
                                        {round.totalStrikesLanded}/{round.totalStrikesAttempted}
                                    </td>
                                    <td>Total Strikes</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].totalStrikesLanded,
                                        round.totalStrikesLanded,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].totalStrikesLanded}/{fighter2Rounds[index].totalStrikesAttempted}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.knockdowns,
                                        fighter2Rounds[index].knockdowns,
                                        highlightStats
                                    )}>
                                        {round.knockdowns}
                                    </td>
                                    <td>Knockdowns</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].knockdowns,
                                        round.knockdowns,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].knockdowns}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.takedownsLanded,
                                        fighter2Rounds[index].takedownsLanded,
                                        highlightStats
                                    )}>
                                        {round.takedownsLanded}/{round.takedownsAttempted}
                                    </td>
                                    <td>Takedowns</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].takedownsLanded,
                                        round.takedownsLanded,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].takedownsLanded}/{fighter2Rounds[index].takedownsAttempted}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.submissionAttempts,
                                        fighter2Rounds[index].submissionAttempts,
                                        highlightStats
                                    )}>
                                        {round.submissionAttempts}
                                    </td>
                                    <td>Submission Attempts</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].submissionAttempts,
                                        round.submissionAttempts,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].submissionAttempts}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.reversals,
                                        fighter2Rounds[index].reversals,
                                        highlightStats
                                    )}>
                                        {round.reversals}
                                    </td>
                                    <td>Reversals</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].reversals,
                                        round.reversals,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].reversals}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.controlTime,
                                        fighter2Rounds[index].controlTime,
                                        highlightStats
                                    )}>
                                        {formatTime(round.controlTime)}
                                    </td>
                                    <td>Control Time</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].controlTime,
                                        round.controlTime,
                                        highlightStats
                                    )}>
                                        {formatTime(fighter2Rounds[index].controlTime)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.headStrikesLanded,
                                        fighter2Rounds[index].headStrikesLanded,
                                        highlightStats
                                    )}>
                                        {round.headStrikesLanded}/{round.headStrikesAttempted}
                                    </td>
                                    <td>Head</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].headStrikesLanded,
                                        round.headStrikesLanded,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].headStrikesLanded}/{fighter2Rounds[index].headStrikesAttempted}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.bodyStrikesLanded,
                                        fighter2Rounds[index].bodyStrikesLanded,
                                        highlightStats
                                    )}>
                                        {round.bodyStrikesLanded}/{round.bodyStrikesAttempted}
                                    </td>
                                    <td>Body</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].bodyStrikesLanded,
                                        round.bodyStrikesLanded,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].bodyStrikesLanded}/{fighter2Rounds[index].bodyStrikesAttempted}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.legStrikesLanded,
                                        fighter2Rounds[index].legStrikesLanded,
                                        highlightStats
                                    )}>
                                        {round.legStrikesLanded}/{round.legStrikesAttempted}
                                    </td>
                                    <td>Leg</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].legStrikesLanded,
                                        round.legStrikesLanded,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].legStrikesLanded}/{fighter2Rounds[index].legStrikesAttempted}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.distanceStrikesLanded,
                                        fighter2Rounds[index].distanceStrikesLanded,
                                        highlightStats
                                    )}>
                                        {round.distanceStrikesLanded}/{round.distanceStrikesAttempted}
                                    </td>
                                    <td>Distance</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].distanceStrikesLanded,
                                        round.distanceStrikesLanded,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].distanceStrikesLanded}/{fighter2Rounds[index].distanceStrikesAttempted}
                                    </td>
                                </tr>

                                <tr>
                                    <td className={getHighlightClass(
                                        round.clinchStrikesLanded,
                                        fighter2Rounds[index].clinchStrikesLanded,
                                        highlightStats
                                    )}>
                                        {round.clinchStrikesLanded}/{round.clinchStrikesAttempted}
                                    </td>
                                    <td>Clinch</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].clinchStrikesLanded,
                                        round.clinchStrikesLanded,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].clinchStrikesLanded}/{fighter2Rounds[index].clinchStrikesAttempted}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getHighlightClass(
                                        round.groundStrikesLanded,
                                        fighter2Rounds[index].groundStrikesLanded,
                                        highlightStats
                                    )}>
                                        {round.groundStrikesLanded}/{round.groundStrikesAttempted}
                                    </td>
                                    <td>Ground</td>
                                    <td className={getHighlightClass(
                                        fighter2Rounds[index].groundStrikesLanded,
                                        round.groundStrikesLanded,
                                        highlightStats
                                    )}>
                                        {fighter2Rounds[index].groundStrikesLanded}/{fighter2Rounds[index].groundStrikesAttempted}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </>
    );
}

export default BoutProfile;