function AddFighterForm({
    firstName, setFirstName,
    lastName, setLastName,
    submissions, setSubmissions,
    knockouts, setKnockouts, 
    decisions, setDecisions,
    addFighter, editingIndex
}) {
    return (
        <div>
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
        <button onClick={addFighter}>
            {editingIndex === null ? "Add Fighter" : "Save changes"}
        </button>
        </div>
    );
}

export default AddFighterForm;