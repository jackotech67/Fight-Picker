import { useNavigate } from "react-router-dom";

function FighterForm({
    firstName, setFirstName,
    lastName, setLastName,
    divisionRank, setDivisionRank,
    weightClass, setWeightClass, weightClasses,
    country, setCountry,
    height, setHeight,
    reach, setReach,
    stance, setStance,
    age, setAge,
    careerWins, setCareerWins,
    careerLosses, setCareerLosses,
    careerDraws, setCareerDraws,
    careerNoContests, setCareerNoContests,
    submissionWins, setSubmissionWins,
    knockoutWins, setKnockoutWins, 
    decisionWins, setDecisionWins,
    strikesPerMin, setStrikesPerMin,
    strikingAccuracy, setStrikingAccuracy,
    strikesAbsorbedPerMin, setStrikesAbsorbedPerMin,
    strikingDefence, setStrikingDefence,
    takedownsPer15Min, setTakedownsPer15Min,
    takedownAccuracy, setTakedownAccuracy,
    takedownDefence, setTakedownDefence,
    submissionsPer15Min, setSubmissionsPer15Min,
    saveFighter, mode
}) {

    const navigate = useNavigate();

    return (
        <div className="fighter-profile">
            <button
                className="back-button"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className="fighter-header">
                <div>
                    <h1>
                        <input 
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name" 
                        />
                        <input 
                            type="text" 
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                        />
                    </h1>
                    <h2>
                        <input 
                            type="text"
                            value={divisionRank}
                            onChange={(e) => setDivisionRank(e.target.value)}
                            placeholder="Rank (C, 1-15, NR)"
                        />
                    </h2>
                    <h2>
                        <select
                            value={weightClass}
                            onChange={(e) => setWeightClass(e.target.value)} 
                        >
                            {weightClasses.map((weightClass) => (
                                <option key={weightClass} value={weightClass}>
                                    {weightClass}
                                </option>
                            ))}
                        </select>    
                    </h2>
                </div>
                <h2>
                    <input 
                        type="number"
                        value={careerWins}
                        onChange={(e) => setCareerWins(e.target.value)}
                        placeholder="Wins" 
                    />
                    <input 
                        type="number" 
                        value={careerLosses}
                        onChange={(e) => setCareerLosses(e.target.value)}
                        placeholder="Losses"
                    />
                    <input 
                        type="number" 
                        value={careerDraws}
                        onChange={(e) => setCareerDraws(e.target.value)}
                        placeholder="Draws"
                    />
                </h2>
            </div>
            <div className="fighter-content-wrap">
                <div className="fighter-summary">
                    <h2>Profile</h2>
                    <p>
                        Country:
                        <input 
                            type="text" 
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Country"
                        />
                    </p>
                    <p>
                        Height: 
                        <input 
                            type="text" 
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            placeholder="Height"
                        />
                    </p>    
                    <p>
                        Reach: 
                        <input 
                            type="text" 
                            value={reach}
                            onChange={(e) => setReach(e.target.value)}
                            placeholder="Reach"
                        />
                    </p>
                    <p>
                        Stance: 
                        <select
                                value={stance}
                                onChange={(e) => setStance(e.target.value)} 
                            >
                                {["Orthodox", "Southpaw", "Switch"].map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                        </select>  
                    </p>
                    <p>
                        Age:
                        <input 
                            type="text"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Age"
                        />
                    </p>
                </div>
                <div className="fighter-stats">
                    <h2>Advanced stats</h2>
                    <p>
                        Strikes per min:
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={strikesPerMin}
                            onChange={(e) => setStrikesPerMin(e.target.value)} 
                        />
                    </p>
                    <p>
                        Sriking accuracy:
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={strikingAccuracy}
                            onChange={(e) => setStrikingAccuracy(e.target.value)} 
                        />
                    </p>
                    <p>
                        Strikes absorbed per min:  
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={strikesAbsorbedPerMin}
                            onChange={(e) => setStrikesAbsorbedPerMin(e.target.value)} 
                        />
                    </p>
                    <p>
                        Striking defence:  
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={strikingDefence}
                            onChange={(e) => setStrikingDefence(e.target.value)} 
                        />
                    </p>
                    <p>
                        Takedowns per 15 min: 
                        <input 
                            type="text" 
                            inputMode="decimal"
                            value={takedownsPer15Min}
                            onChange={(e) => setTakedownsPer15Min(e.target.value)}
                        />
                    </p>
                    <p>
                        Takedown accuracy:
                        <input 
                            type="text" 
                            inputMode="decimal"
                            value={takedownAccuracy}
                            onChange={(e) => setTakedownAccuracy(e.target.value)}
                        />
                    </p>
                    <p>
                        Takedown defence:
                        <input 
                            type="text" 
                            inputMode="decimal"
                            value={takedownDefence}
                            onChange={(e) => setTakedownDefence(e.target.value)}
                        />
                    </p>
                    <p>
                        Submissions per 15 min:
                        <input 
                            type="text" 
                            inputMode="decimal"
                            value={submissionsPer15Min}
                            onChange={(e) => setSubmissionsPer15Min(e.target.value)}
                        />
                    </p>

                </div>
                <div className="fighter-notes">
                    <h2>Wins by Method</h2>
                    <p>
                        KO/TKO:
                        <input 
                            type="text" 
                            inputMode="numeric"
                            value={knockoutWins ?? ""}
                            onChange={(e) => setKnockoutWins(e.target.value)}
                        />
                    </p>
                    <p>
                        Submissions:
                        <input 
                            type="text" 
                            inputMode="numeric"
                            value={submissionWins ?? ""}
                            onChange={(e) => setSubmissionWins(e.target.value)}
                        />
                    </p>
                    <p>
                        Decisions:
                        <input 
                            type="text" 
                            inputMode="numeric"
                            value={decisionWins}
                            onChange={(e) => setDecisionWins(e.target.value)}
                        />
                    </p>
                </div>
            </div>
            <button onClick={saveFighter}>
                Save Changes
            </button>
        </div>
        
        );
}

export default FighterForm;