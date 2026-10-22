require("dotenv").config();

async function testCito() {
    const fighterSlug = "alexander-volkanovski";
    const response = await fetch(
        `https://api.citoapi.com/api/v1/ufc/fighters/${fighterSlug}/stats`,
        {
            headers: {
                "x-api-key": process.env.CITO_API_KEY
            }
        }
    );

    const data = await response.json();
    const fighter = data.data;

    console.log(JSON.stringify(data, null, 2));
}

testCito();