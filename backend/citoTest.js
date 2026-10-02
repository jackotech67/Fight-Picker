require("dotenv").config();

// HELPER FUNCTIONS
function splitStat(stat) {
    const [landed, attempted] = stat.split(" of ");

    return {
        landed: Number(landed),
        attempted: Number(attempted)
    }
}

function timeToSeconds(time) {
    const [minutes, seconds] = time.split(":");
    return (Number(minutes) * 60) + Number(seconds);
}

async function testCito() {
    const response = await fetch(
        "https://api.citoapi.com/api/v1/ufc/fighters/patricio-freire",
        {
            headers: {
                "X-API-KEY": process.env.CITO_API_KEY
            }
        }
    );

    const result = await response.json();

    console.log("Name:", result.data?.name);
    console.log("Stance:", result.data?.stance);
}

testCito();