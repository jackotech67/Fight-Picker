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
        `);

        for (const fighter of result.rows) {

            console.log(`Fetching ${fighter.first_name} ${fighter.last_name}`);

            const response = await fetch(
                `https://api.citoapi.com/api/v1/ufc/fighters/${fighter.cito_slug}`,
                {
                    headers: {
                        "x-api-key": process.env.CITO_API_KEY
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Cito API error: ${response.status}`);
            }

            const data = await response.json();
            
            const fighterProfile = data.data;

            const imageUrl = fighterProfile?.headshotUrl;
            const bodyImageUrl = fighterProfile?.bodyImageUrl;
            const isActive = fighterProfile?.isActive;
            const championStatus = fighterProfile?.championStatus;

            const divisionRank = fighterProfile?.rankings?.find(
                (ranking) => 
                    ranking.system === "meta" &&
                    ranking.division === fighterProfile.division
            )?.rank ?? null;
            
            const p4pRank = fighterProfile?.rankings?.find(
                (ranking) => 
                    ranking.system === "meta" &&
                    ranking.division?.includes("Pound-for-Pound")
            )?.rank ?? null;

            await pool.query(`
                UPDATE fighters
                SET image_url = COALESCE($1, image_url),
                    body_image_url = COALESCE($2, body_image_url),
                    is_active = $3,
                    division_rank = $4,
                    p4p_rank = $5,
                    champion_status = $6
                WHERE id = $7
            `, [
                imageUrl,
                bodyImageUrl, 
                isActive,
                divisionRank,
                p4pRank,
                championStatus,
                fighter.id
                ]
            );

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