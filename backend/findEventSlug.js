require("dotenv").config();

const CITO_API_KEY = process.env.CITO_API_KEY;

const eventType = process.argv[2];

if (!eventType) {
    console.log("Usage: node findEventSlug.js <upcoming | past>");
    process.exit();
}

const endpoint = eventType === "upcoming"
    ? "https://api.citoapi.com/api/v1/ufc/events/upcoming"
    : "https://api.citoapi.com/api/v1/ufc/events/recent";


async function findEventSlug() {
    const response = await fetch(endpoint, {
        headers: {
            "x-api-key": CITO_API_KEY
        }
    });

    const data = await response.json();

    data.data.forEach((event) => {
        console.log(`${event.title} -> Slug: ${event.slug}\n`);
    });
}

findEventSlug();