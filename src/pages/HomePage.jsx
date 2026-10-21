import '../App.css'
import Navbar from '../components/Navbar';
import { useState, useEffect, useRef, Fragment } from 'react';
import { Link } from "react-router-dom";
import { formatHeight, formatRate, formatPercentage } from '../utils/formatStats';
import OddsForm from '../components/OddsForm';

const API_URL = import.meta.env.VITE_API_URL;

function HomePage({ isAdmin, unlockAdmin, lockAdmin }) {

    const comparisonRef = useRef(null);
    const [upcomingEvent, setUpcomingEvent] = useState(null);
    const [selectedCard, setSelectedCard] = useState("Main Card");
    const [editingBout, setEditingBout] = useState(null);
    const [boutOdds, setBoutOdds] = useState({});

    const displayedBouts = upcomingEvent?.bouts?.filter(
        (bout) => bout.cardSection === selectedCard
    ) || [];

    useEffect(() => {
        fetch(`${API_URL}/events/upcoming`)
            .then((response) => response.json())
            .then((data) => setUpcomingEvent(data));
    }, []);

    useEffect(() => {
        if (!upcomingEvent?.bouts) return;

        async function loadOdds() {
            try {
                const results = await Promise.all(
                    upcomingEvent.bouts.map(async (bout) => {
                        const response = await fetch(`${API_URL}/bouts/${bout.id}/odds`);

                        if (!response.ok) throw new Error("Failed to fetch odds");

                        return {
                            boutId: bout.id,
                            data: await response.json()
                        };
                    })
                );

                const existingOdds = {};

                results.forEach(({ boutId, data }) => {
                    data.filter((entry) => entry.bookmaker === "TAB NZ")
                        .forEach((entry) => {
                            existingOdds[`${boutId}-${entry.fighterId}`] = entry.decimalOdds;
                        });
                });

                setBoutOdds(existingOdds);
            } catch (error) {
                console.error("Failed to load odds:", error);
            }
        }

        loadOdds();
    }, [upcomingEvent]);

    const [fighter1, setFighter1] = useState(null);
    const [fighter2, setFighter2] = useState(null);
    const [showComparison, setShowComparison] = useState(false);

    const [highlightStats, setHighlightStats] = useState(false);

    function compareFighters(fighter1, fighter2) {
        setFighter1(fighter1);
        setFighter2(fighter2);
        setShowComparison(true);

        comparisonRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    function resetMatchup() {
        setFighter1(null);
        setFighter2(null);
        setShowComparison(false);
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
                <h2>Stat attack</h2>
                <h3>Select 🥊 to compare fighters</h3>
                <div className="comparison-controls">
                    <div className="comparison-buttons">
                        <button onClick={resetMatchup}>Reset</button>
                        <button onClick={() => setHighlightStats(!highlightStats)}>
                            {highlightStats ? "Hide Highlights" : "Highlight Stats"}
                        </button>
                    </div>
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
                                        {formatHeight(fighter1.height)}
                                    </td>
                                    <td>Height</td>
                                    <td className={getWinner(fighter2.height, fighter1.height)}>
                                        {formatHeight(fighter2.height)}
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
                                        {formatRate(fighter1.strikesPerMin)}
                                    </td>
                                    <td>Strikes per min</td>
                                    <td className={getWinner(fighter2.strikesPerMin, fighter1.strikesPerMin)}>
                                        {formatRate(fighter2.strikesPerMin)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.strikingAccuracy, fighter2.strikingAccuracy)}>
                                        {formatPercentage(fighter1.strikingAccuracy)}
                                    </td>
                                    <td>Striking accuracy %</td>
                                    <td className={getWinner(fighter2.strikingAccuracy, fighter1.strikingAccuracy)}>
                                        {formatPercentage(fighter2.strikingAccuracy)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getLoser(fighter1.strikesAbsorbedPerMin, fighter2.strikesAbsorbedPerMin)}>
                                        {formatRate(fighter1.strikesAbsorbedPerMin)}
                                    </td>
                                    <td>Strikes absorbed per min</td>
                                    <td className={getLoser(fighter2.strikesAbsorbedPerMin, fighter1.strikesAbsorbedPerMin)}>
                                        {formatRate(fighter2.strikesAbsorbedPerMin)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.strikingDefence, fighter2.strikingDefence)}>
                                        {formatPercentage(fighter1.strikingDefence)}
                                    </td>
                                    <td>Striking defence %</td>
                                    <td className={getWinner(fighter2.strikingDefence, fighter1.strikingDefence)}>
                                        {formatPercentage(fighter2.strikingDefence)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.takedownsPer15Min, fighter2.takedownsPer15Min)}>
                                        {formatRate(fighter1.takedownsPer15Min)}
                                    </td>
                                    <td>Takedowns per 15 min</td>
                                    <td className={getWinner(fighter2.takedownsPer15Min, fighter1.takedownsPer15Min)}>
                                        {formatRate(fighter2.takedownsPer15Min)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.takedownAccuracy, fighter2.takedownAccuracy)}>
                                        {formatPercentage(fighter1.takedownAccuracy)}
                                    </td>
                                    <td>Takedown accuracy %</td>
                                    <td className={getWinner(fighter2.takedownAccuracy, fighter1.takedownAccuracy)}>
                                        {formatPercentage(fighter2.takedownAccuracy)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.takedownDefence, fighter2.takedownDefence)}>
                                        {formatPercentage(fighter1.takedownDefence)}
                                    </td>
                                    <td>Takedown defence %</td>
                                    <td className={getWinner(fighter2.takedownDefence, fighter1.takedownDefence)}>
                                        {formatPercentage(fighter2.takedownDefence)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={getWinner(fighter1.submissionsPer15Min, fighter2.submissionsPer15Min)}>
                                        {formatRate(fighter1.submissionsPer15Min)}
                                    </td>
                                    <td>Submissions per 15 min</td>
                                    <td className={getWinner(fighter2.submissionsPer15Min, fighter1.submissionsPer15Min)}>
                                        {formatRate(fighter2.submissionsPer15Min)}
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
            <div className="card-selector">
                <button 
                    onClick={() => setSelectedCard("Main Card")}
                    className={selectedCard === "Main Card" ? "active" : ""}    
                >
                    Main Card
                </button>
                <button 
                    onClick={() => setSelectedCard("Prelims")}
                    className={selectedCard === "Prelims" ? "active" : ""}
                >
                    Prelims
                </button>
                {upcomingEvent?.bouts?.some(bout => bout.cardSection === "Early Prelims") && (
                    <button
                        onClick={() => setSelectedCard("Early Prelims")}
                        className={selectedCard === "Early Prelims" ? "active" : ""}
                    >
                        Early Prelims
                    </button>
                )}
            </div>
            <div className="upcoming-event">
                <h2>{upcomingEvent?.name}</h2>
                    {isAdmin && !editingBout && (
                        <button onClick={() => setEditingBout(upcomingEvent)}>
                            Edit Odds
                        </button>
                    )}
                <table className="event-matchups">
                    <tbody>
                        {displayedBouts.map((bout) => (
                            <Fragment key={bout.id}>
                                <tr className="bout-weight-class" key={`${bout.id}-weight`}>
                                    <th colSpan="3">
                                        {bout.fighters[0]?.weightClass || bout.fighters[1]?.weightClass}
                                    </th>
                                </tr>

                                <tr className="bout-matchup" key={bout.id}>
                                    <td>
                                        <div className="matchup-fighter matchup-fighter-left">
                                            <img
                                                src={bout.fighters[0]?.imageUrl || "/placeholder-fighter-headshot.png"}
                                                alt={`${bout.fighters[0]?.firstName} ${bout.fighters[0]?.lastName}`}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "/placeholder-fighter.png";
                                                }}
                                            />
                                            <div className='matchup-fighter-stats matchup-fighter-stats-left'>
                                                <Link to={`/fighter/${bout.fighters[0]?.id}`}>
                                                    {bout.fighters[0]?.championStatus === "champion"
                                                        ? "👑 "
                                                        : bout.fighters[0]?.divisionRank != null
                                                            ? `#${bout.fighters[0].divisionRank} `
                                                            : ""}
                                                    {bout.fighters[0]?.firstName} {bout.fighters[0]?.lastName}
                                                </Link>
                                                <div className="fighter-record">
                                                    {bout.fighters[0]?.careerWins}-
                                                    {bout.fighters[0]?.careerLosses}-
                                                    {bout.fighters[0]?.careerDraws}
                                                </div>
                                                {!editingBout && boutOdds[`${bout.id}-${bout.fighters[0]?.id}`] && (
                                                    <div className="fighter-odds">
                                                        {Number(boutOdds[`${bout.id}-${bout.fighters[0]?.id}`]).toFixed(2)}
                                                    </div>
                                                )}
                                                {editingBout && (
                                                    <input
                                                        className="fighter-odds-input"
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="Odds"
                                                        value={boutOdds[`${bout.id}-${bout.fighters[0]?.id}`] ?? ""}
                                                        onChange={(e) => {
                                                            setBoutOdds((previous) => ({
                                                                ...previous,
                                                                [`${bout.id}-${bout.fighters[0]?.id}`]: e.target.value
                                                            }));
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                       
                                    </td>
                                    <td>
                                        <button
                                            className='compare-fighters-button'
                                            onClick={() => compareFighters(bout.fighters[0], bout.fighters[1])}
                                        >
                                            🥊
                                        </button>
                                        <div>VS</div>
                                    </td>
                                    <td>
                                        <div className="matchup-fighter matchup-fighter-right">
                                            <img
                                                src={bout.fighters[1]?.imageUrl || "/placeholder-fighter-headshot.png"}
                                                alt={`${bout.fighters[1]?.firstName} ${bout.fighters[1]?.lastName}`}
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = "/placeholder-fighter.png";
                                                }}
                                            />
                                            <div className='matchup-fighter-stats matchup-fighter-stats-left'>
                                                <Link to={`/fighter/${bout.fighters[1]?.id}`}>
                                                    {bout.fighters[1]?.championStatus === "champion"
                                                        ? "👑 "
                                                        : bout.fighters[1]?.divisionRank != null
                                                            ? `#${bout.fighters[1].divisionRank} `
                                                            : ""}
                                                    {bout.fighters[1]?.firstName} {bout.fighters[1]?.lastName}
                                                </Link>
                                                <div className="fighter-record">
                                                    {bout.fighters[1]?.careerWins}-
                                                    {bout.fighters[1]?.careerLosses}-
                                                    {bout.fighters[1]?.careerDraws}
                                                </div>
                                                {!editingBout && boutOdds[`${bout.id}-${bout.fighters[1]?.id}`] && (
                                                    <div className="fighter-odds">
                                                        {Number(boutOdds[`${bout.id}-${bout.fighters[1]?.id}`]).toFixed(2)}
                                                    </div>
                                                )}
                                                {editingBout && (
                                                    <input
                                                        className="fighter-odds-input"
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="Odds"
                                                        value={boutOdds[`${bout.id}-${bout.fighters[1]?.id}`] ?? ""}
                                                        onChange={(e) => {
                                                            setBoutOdds((previous) => ({
                                                                ...previous,
                                                                [`${bout.id}-${bout.fighters[1]?.id}`]: e.target.value
                                                            }));
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </Fragment>
                        ))}
                    </tbody>
                </table>
                {editingBout && (
                    <OddsForm
                        event={editingBout}
                        odds={boutOdds}
                        onClose={() => setEditingBout(null)}
                    />
                )}
            </div>
        </div> 
    );
}

export default HomePage;