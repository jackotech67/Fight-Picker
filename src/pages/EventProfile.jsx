import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function EventProfile() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/events/${id}`)
            .then((response) => response.json())
            .then((data) => setEvent(data));
    }, [id]);

    if (!event) return <p>Loading...</p>;

    function renderCardSection(cardSection) {
        return event.bouts
            .filter((bout) => bout.cardSection === cardSection)
            .map((bout) => (
                <Link
                    to={`/bouts/${bout.id}`}
                    className="event-bout"
                    key={bout.id}
                >
                    <span>
                        {bout.fighters[0]?.firstName} {bout.fighters[0]?.lastName}
                    </span>

                    <span> vs </span>

                    <span>
                        {bout.fighters[1]?.firstName} {bout.fighters[1]?.lastName}
                    </span>
                </Link>
            ));
    }

    return (
        <main className="event-profile">
            <h1>{event.name}</h1>
            <p>
                {new Date(event.eventDate).toLocaleDateString("en-NZ", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                })}
            </p>

            <h2>Main Card</h2>
            {renderCardSection("Main Card")}

            <h2>Prelims</h2>
            {renderCardSection("Prelims")}

            <h2>Early Prelims</h2>
            {renderCardSection("Early Prelims")}
        </main>
    );
}

export default EventProfile;