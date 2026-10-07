import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function EventsPage() {

    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/events`)
        .then ((response) => response.json())
        .then((data) => setEvents(data));
    }, []);

    return (
        <main className="events-page">
            <h1>Events</h1>

            {events.map((event) => (
                <Link
                    to={`/events/${event.id}`}
                    className="event-row"
                    key={event.id}
                >
                    <span>{event.name}</span>
                    <span>{event.mainEvent}</span>
                    <span>
                        {new Date(event.eventDate).toLocaleDateString("en-NZ", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}
                    </span>
                </Link>
            ))}
        </main>
    );
}

export default EventsPage;