function FighterCard ({
    fighter, 
    index, 
    deleteFighter,
    startEditing,
    selectFighter,
    isAdmin
}) {
    return (
        <div className="fighter-card">
            <h2>{fighter.firstName} {fighter.lastName}</h2>
            <div className="fighter-record">
                <p>Subs: {fighter.record.submissions}</p>
                <p>KOs: {fighter.record.knockouts}</p>
                <p>Decisions: {fighter.record.decisions}</p>
            </div>

            <div className="select-button">
                <button onClick={() => selectFighter(fighter)}>
                    Select
                </button>
            </div>

            {isAdmin && (
                <div className="admin-buttons">
                    <button onClick={() => deleteFighter(fighter.id)}>
                        Delete
                    </button>
                    <button onClick={() => startEditing(fighter)}>
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
}

export default FighterCard;