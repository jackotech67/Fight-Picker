require("dotenv").config();

async function testCito() {
    const response = await fetch(
        "https://api.citoapi.com/api/v1/ufc/fighters/joaquin-buckley",
        {
            headers: {
                "x-api-key": process.env.CITO_API_KEY
            }
        }
    );

    const data = await response.json();
    console.log(JSON.stringify(data.data, null, 2));
    }

testCito();