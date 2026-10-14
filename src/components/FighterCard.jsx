import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getCountryFlag } from "../utils/countryFlags";

function FighterCard ({
    fighter, 
    deleteFighter,
    isAdmin,
}) {
    const navigate = useNavigate();

    return (
        <div className="fighter-card">
            <Link to={`/fighter/${fighter.id}`} className="fighter-card-link">
                <img
                    src={fighter.bodyImageUrl || "/placeholder-fighter-body.png"}
                    alt={`${fighter.firstName} ${fighter.lastName}`}
                    loading="lazy"
                />
                <h2>
                    {fighter.firstName} {fighter.lastName}
                </h2>
            </Link>

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