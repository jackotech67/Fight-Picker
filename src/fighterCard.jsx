import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function FighterCard ({
    fighter, 
    deleteFighter,
    selectFighter,
    isAdmin
}) {
    const navigate = useNavigate();
    return (
        <div className="fighter-card">
            <h2>
                <Link to={`/fighter/${fighter.id}`}>
                    {fighter.firstName} {fighter.lastName}
                </Link>
            </h2>

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
                    <button onClick={() => navigate(`/fighters/${fighter.id}/edit`)}>
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
}

export default FighterCard;