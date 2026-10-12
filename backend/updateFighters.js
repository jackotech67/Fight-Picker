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
            const response = await fetch(
                `https://api.citoapi.com/api/v1/ufc/fighters/${fighter.cito_slug}`,
                {
                    headers: {
                        "x-api-key": process.env.CITO_API_KEY
                    }
                }
            );

            const data = await response.json();
            
            const fighterProfile = data.data;

            const imageUrl = fighterProfile?.headshotUrl;
            const isActive = fighterProfile?.isActive;
            const championStatus = fighterProfile?.championStatus;

            const divisionRank = fighterProfile?.rankings?.find(
                (ranking) => 
                    ranking.system === "media" &&
                    ranking.division === fighterProfile.division
            )?.rank ?? null;
            
            const p4pRank = fighterProfile?.rankings?.find(
                (ranking) => 
                    ranking.system === "media" &&
                    ranking.division.includes("Pound-for-Pound")
            )?.rank ?? null;

            await pool.query(`
                UPDATE fighters
                SET image_url = COALESCE($1, image_url),
                    is_active = $2,
                    division_rank = $3,
                    p4p_rank = $4,
                    champion_status = $5
                WHERE id = $6
            `, [
                imageUrl, 
                isActive,
                divisionRank,
                p4pRank,
                championStatus,
                fighter.id]);

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