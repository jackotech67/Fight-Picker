function FighterCard ({
    fighter, 
    deleteFighter,
    startEditing,
    selectFighter,
    isAdmin
}) {
    return (
        <div className="fighter-card">
            <h2>{fighter.firstName} {fighter.lastName}</h2>

            <p>{fighter.weightClass}</p>
            
            <div className="fighter-record">
                <p>Subs: {fighter.submissions}</p>
                <p>KOs: {fighter.knockouts}</p>
                <p>Decisions: {fighter.decisions}</p>
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