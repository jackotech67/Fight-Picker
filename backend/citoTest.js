require("dotenv").config();

async function testCito() {
    const response = await fetch(
        "https://api.citoapi.com/api/v1/ufc/fighters/brendan-allen",
        {
            headers: {
                "X-API-KEY": process.env.CITO_API_KEY
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Cito API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}

testCito();