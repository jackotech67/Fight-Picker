import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function formatEventName(name) {
    if (name.startsWith("UFC Fight Night")) {
        return "UFC Fight Night";
    } else if (name.startsWith("Crypto.com ")) {
        return formatEventName(name.replace("Crypto.com ", ""));
    } else if (/^UFC \d+/.test(name)) {
        return name.match(/^UFC \d+/)[0];
    }

    return name;
}

function formatEventDate(date) {
    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "UTC"
    });
}

function EventsPage() {

    const navigate = useNavigate();
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/events`)
        .then ((response) => response.json())
        .then((data) => setEvents(data));
    }, []);

    return (
        <>
            <main className="events-page">
                <button onClick={() => navigate(-1)} className="back-button">
                    ← Back
                </button>
                <h1>Events</h1>

                {events.map((event) => (
                    <Link
                        to={`/events/${event.id}`}
                        className="event-row"
                        key={event.id}
                    >
                        <span>{formatEventName(event.name)}</span>
                        <span>{event.mainEvent}</span>
                        <span className="event-date">
                            <span className="desktop-date">
                                {new Date(event.eventDate).toLocaleDateString("en-NZ", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    timeZone: "UTC"
                                })}
                            </span>

                            <span className="mobile-date">
                                {formatEventDate(event.eventDate)}
                            </span>
                        </span>
                    </Link>
                ))}
            </main>
        </>
    );
}

export default EventsPage;