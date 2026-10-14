require("dotenv").config();

async function testCito() {
    const fighterSlug = "lucas-armand";
    const response = await fetch(
        `https://api.citoapi.com/api/v1/ufc/fighters/${fighterSlug}`,
        {
            headers: {
                "x-api-key": process.env.CITO_API_KEY
            }
        }
    );

    const data = await response.json();
    const fighter = data.data;

    console.log(
        Object.entries(fighter).filter(([key]) =>
            /image|photo|headshot|avatar|thumbnail|picture/i.test(key)
        )
    );
}

testCito();