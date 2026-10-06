import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

countries.registerLocale(en);

function FighterCard ({
    fighter, 
    deleteFighter,
    isAdmin,
}) {
    const navigate = useNavigate();

    function getCountryFlag(country) {
        if (!country) return "🌐";

        const countryCode = countries.getAlpha2Code(country, "en");

        if (!countryCode) return "🌐";

        return countryCode
            .toUpperCase()
            .replace(/./g, (char) =>
                String.fromCodePoint(127397 + char.charCodeAt())
            );
    }

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
                {getCountryFlag(fighter.country)} {fighter.country || "Country unavailable"}
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