function FighterCard ({
    fighter, 
    index, 
    deleteFighter,
    startEditing
}) {
    return (
        <div>
            <h2>{fighter.firstName} {fighter.lastName}</h2>
            <p>Subs: {fighter.record.submissions}</p>
            <p>KOs: {fighter.record.knockouts}</p>
            <p>Decisions: {fighter.record.decisions}</p>

            <button onClick={() => deleteFighter(index)}>
                Delete
            </button>
            <button onClick={() => startEditing(fighter, index)}>
                Edit
            </button>
        </div>
    );
}

export default FighterCard;