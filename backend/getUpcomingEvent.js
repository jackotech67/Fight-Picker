require("dotenv").config();

const CITO_API_KEY = process.env.CITO_API_KEY;

async function getUpcomingEvent() {
    const response = await fetch(
        "https://api.citoapi.com/api/v1/ufc/events/upcoming",
        {
            headers: {
                "x-api-key": CITO_API_KEY
            }
        }
    );
    const data = await response.json();
    
    const nextUfcEvent = data.data.find((event) => 
        event.slug.startsWith("ufc")
    );

    console.log(nextUfcEvent.title);
    console.log(nextUfcEvent.slug);
}

getUpcomingEvent();