require("dotenv").config();

async function testCito() {
    const response = await fetch(
        "https://api.citoapi.com/api/v1/ufc/fighters/arman-tsarukyan",
        {
            headers: {
                "x-api-key": process.env.CITO_API_KEY
            }
        }
    );

    const data = await response.json();
    const fighter = data.data;

    console.log(
        data.data.rankings
    );
}

testCito();