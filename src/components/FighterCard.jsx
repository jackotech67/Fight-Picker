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

            <h2>
                <Link to={`/fighter/${fighter.id}`}>
                    {fighter.firstName} {fighter.lastName}
                </Link>
            </h2>

            <p>{fighter.weightClass}</p>

            <div className="fighter-record">
                <p>
                    {fighter.careerWins}-{fighter.careerLosses}-{fighter.careerDraws}
                </p>
            </div>
            <p>
                {getCountryFlag(fighter.country)} 
            </p>

            

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