function AddFighterForm({
    firstName, setFirstName,
    lastName, setLastName,
    weightClass, setWeightClass, weightClasses,
    height, setHeight,
    reach, setReach,
    stance, setStance,
    age, setAge,
    careerWins, setCareerWins,
    careerLosses, setCareerLosses,
    careerDraws, setCareerDraws,
    careerNoContests, setCareerNoContests,
    submissions, setSubmissions,
    knockouts, setKnockouts, 
    decisions, setDecisions,
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
    return (
        <div className="fighter-form">
            <div className="fighter-form-content">
                <p>* indicates must be filled</p>
                <div className="fighter-basic-info">
                    <h4>Basic *</h4>
                    <div className="form-row">
                        <label htmlFor="firstName">First Name:</label>
                        <input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="lastName">Last Name:</label>
                        <input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <select
                        value={weightClass}
                        onChange={(e) => setWeightClass(e.target.value)}
                    >
                        <option value="">Select weight class</option>
                        {weightClasses.map((weightClass) => (
                            <option key={weightClass} value={weightClass}>
                                {weightClass}
                            </option>
                        ))}
                    </select> 
                </div>

                <div className="fighter-general-info">
                    <h4>General *</h4>
                    <div className="form-row">
                        <label htmlFor="height">Height (cm):</label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="reach">Reach (in):</label>
                        <input
                            type="number"
                            value={reach}
                            onChange={(e) => setReach(Number(e.target.value))}
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="age">Age:</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                        />
                    </div>
                    <select
                        value={stance}
                        onChange={(e) => setStance(e.target.value)}
                    >
                        <option value="">Select stance</option>
                        <option value="Orthodox">Orthodox</option>
                        <option value="Southpaw">Southpaw</option>
                        <option value="Switch">Switch</option>
                    </select>
                </div>

                <div className="fighter-career-info">
                    <h4>Career *</h4>
                    <div className="form-row">
                        <label htmlFor="careerWins">Career Wins:</label>
                        <input
                            type="number"
                            value={careerWins}
                            onChange={(e) => setCareerWins(Number(e.target.value))}
                        />  
                    </div>
                    <div className="form-row">
                        <label htmlFor="careerLosses">Career Losses:</label>
                        <input
                            type="number"
                            value={careerLosses}
                            onChange={(e) => setCareerLosses(Number(e.target.value))}
                        />
                    </div>
                    <div className="form-row"> 
                        <label htmlFor="careerDraws">Career Draws:</label>
                        <input
                            type="number"
                            value={careerDraws}
                            onChange={(e) => setCareerDraws(Number(e.target.value))}
                        />      
                    </div>
                    <div className="form-row">
                        <label htmlFor="careerNoContests">Career NCs:</label>
                        <input
                            type="number"
                            value={careerNoContests}
                            onChange={(e) => setCareerNoContests(Number(e.target.value))}
                        />  
                    </div>
                </div>

                <div className="fighter-finishes-info">
                    <h4>Finishes *</h4>
                    <div className="form-row">
                        <label htmlFor="submissions">Submissions:</label>
                        <input 
                            type="number"
                            value={submissions}
                            onChange={(e) => setSubmissions(Number(e.target.value))}
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="knockouts">Knockouts:</label>
                        <input 
                            type="number"
                            value={knockouts}
                            onChange={(e) => setKnockouts(Number(e.target.value))}
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="decisions">Decisions:</label>
                        <input 
                            type="number"
                            value={decisions}
                            onChange={(e) => setDecisions(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="fighter-advanced-info">
                    <h4>Advanced</h4>
                    <div className="form-row">
                        <label htmlFor="strikesPerMin">Strikes p/m:</label>
                        <input 
                            type="number"
                            value={strikesPerMin}
                            onChange={(e) => setStrikesPerMin(Number(e.target.value))}
                            placeholder="Strikes per minute"
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="strikingAccuracy">Striking accuracy:</label>
                        <input 
                            type="number"
                            value={strikingAccuracy}
                            onChange={(e) => setStrikingAccuracy(Number(e.target.value))}
                            placeholder="%"
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="strikesAbsorbedPerMin">Strikes absorbed p/m:</label>
                        <input 
                            type="number"
                            value={strikesAbsorbedPerMin}
                            onChange={(e) => setStrikesAbsorbedPerMin(Number(e.target.value))}
                            placeholder="Strikes absorbed per minute"
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="strikingDefence">Striking defence:</label>
                        <input 
                            type="number"
                            value={strikingDefence}
                            onChange={(e) => setStrikingDefence(Number(e.target.value))}
                            placeholder="%"
                        />
                    </div>
                    <div className="form-row">  
                        <label htmlFor="takedownsPer15Min">Takedowns per 15 min:</label>
                        <input 
                            type="number"
                            value={takedownsPer15Min}
                            onChange={(e) => setTakedownsPer15Min(Number(e.target.value))}
                            placeholder="Takedowns per 15 minutes"
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="takedownAccuracy">Takedown accuracy:</label>
                        <input 
                            type="number"
                            value={takedownAccuracy}
                            onChange={(e) => setTakedownAccuracy(Number(e.target.value))}
                            placeholder="%"
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="takedownDefence">Takedown defence:</label>
                        <input 
                            type="number"
                            value={takedownDefence}
                            onChange={(e) => setTakedownDefence(Number(e.target.value))}
                            placeholder="%"
                        />
                    </div>
                    <div className="form-row">
                        <label htmlFor="submissionsPer15Min">Submissions per 15 min:</label>
                        <input 
                            type="number"
                            value={submissionsPer15Min}
                            onChange={(e) => setSubmissionsPer15Min(Number(e.target.value))}
                            placeholder="Submissions per 15 minutes"
                        />
                    </div>
                </div>

                <div className="add-fighter-button">
                    <button onClick={saveFighter}>
                        {mode === "edit" ? "Save Changes" : "Add Fighter"}
                    </button>
                </div>
            </div>
        </div>
        );
}

export default AddFighterForm;