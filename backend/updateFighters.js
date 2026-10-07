require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function updateFighterProfiles() {
    try {
        const result = await pool.query(`
            SELECT id, first_name, last_name, cito_slug
            FROM fighters
            WHERE cito_slug IS NOT NULL
        `);

        for (const fighter of result.rows) {
            const response = await fetch(
                `https://api.citoapi.com/api/v1/ufc/fighters/${fighter.cito_slug}`,
                {
                    headers: {
                        "x-api-key": process.env.CITO_API_KEY
                    }
                }
            );

            const data = await response.json();
            const imageUrl = data.data?.headshotUrl;

            await pool.query(`
                UPDATE fighters
                SET image_url = $1
                WHERE id = $2
            `, [imageUrl, fighter.id]);

            console.log(`Updated ${fighter.first_name} ${fighter.last_name}`);
            await delay(2500);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await pool.end();
    }
}

updateFighterProfiles();