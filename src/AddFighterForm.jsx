function AddFighterForm({
    firstName, setFirstName,
    lastName, setLastName,
    weightClass, setWeightClass, weightClasses,
    submissions, setSubmissions,
    knockouts, setKnockouts, 
    decisions, setDecisions,
    addFighter, editingId,
    height, setHeight,
    reach, setReach,
    stance, setStance,
    age, setAge
}) {
    return (
        <div className="fighter-form">
            <h2>Add Fighter Form</h2>
            <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder='First Name'
        />
        <input  
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder='Last Name'
        />
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
        <input 
            type="number"
            value={submissions}
            onChange={(e) => setSubmissions(Number(e.target.value))}
            placeholder='Submissions'
        />
        <input 
            type="number"
            value={knockouts}
            onChange={(e) => setKnockouts(Number(e.target.value))}
            placeholder='Knockouts' 
        />
        <input 
            type="number"
            value={decisions}
            onChange={(e) => setDecisions(Number(e.target.value))}
            placeholder='Decisions' 
        />
        <input 
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            placeholder='Height'
        />
        <input 
            type="number"
            step='0.1'
            value={reach}
            onChange={(e) => setReach(Number(e.target.value))}
            placeholder="Reach" 
        />
        <select 
            value={stance}
            onChange={(e) => setStance(e.target.value)}
        >
            <option value="">Select Stance</option>
            <option value="Orthodox">Orthodox</option>
            <option value="Southpaw">Southpaw</option>
            <option value="Switch">Switch</option>
        </select>
        <input 
            type="number"
            value={age} 
            onChange={(e) => setAge(Number(e.target.value))}
            placeholder="Age"
        />
        <button onClick={addFighter}>
            {editingId === null ? "Add Fighter" : "Save changes"}
        </button>
        </div>
    );
}

export default AddFighterForm;