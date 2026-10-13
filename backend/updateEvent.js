require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

function splitStat(stat) {
    const [landed, attempted] = stat.split(" of ");
    return {
        landed: Number(landed),
        attempted: Number(attempted)
    };
}

function timeToSeconds(time) {
    const [minutes, seconds] = time.split(":");
    return Number(minutes) * 60 + Number(seconds);
}

async function updateEvent(eventSlug) {
    try {
        // fetch event and update bout statistics
        const result = await pool.query(
            "SELECT id FROM events WHERE cito_slug = $1",
            [eventSlug]
        );
        if (result.rows.length === 0) {
            throw new Error(`Event not found: ${eventSlug}`);
        }

        const eventId = result.rows[0].id;
        console.log(`Updating event ID: ${eventId}`);

        const response = await fetch(
            `https://api.citoapi.com/api/v1/ufc/events/${eventSlug}/bouts`,
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
        const bouts = data.data;

        console.log(`Found ${bouts.length} bouts to update`);

        // loop through each bout in event
        for (const bout of bouts) {
            const boutResult = await pool.query(
                `SELECT id FROM bouts
                WHERE cito_id = $1 AND event_id = $2`,
                [bout.id, eventId]
            );
            if (boutResult.rows.length === 0) {
                console.log(`Bout not found: ${bout.id}`);
                continue;
            }

            const boutId = boutResult.rows[0].id;
            console.log(`Matched bout ID: ${boutId}`);

            await pool.query(
                `UPDATE bouts
                SET method = $1,
                    result_round = $2,
                    result_time = $3
                WHERE id = $4`,
                [bout.method, bout.resultRound, bout.resultTime, boutId]
            );

            // loop through fighters results for each bout
            for (const fighter of bout.fighters ?? []) {
                const fighterResult = await pool.query(
                    `SELECT id FROM fighters WHERE cito_slug = $1
                    UNION
                    SELECT fighter_id AS id FROM fighter_aliases WHERE cito_slug = $1`,
                    [fighter.fighterSlug]
                );

                if (fighterResult.rows.length === 0) {
                    console.log(`Outcome fighter not found: ${fighter.fighterSlug}`);
                    continue;
                }

                const fighterId = fighterResult.rows[0].id;

                const updateResult = await pool.query(
                    `UPDATE bout_performance
                    SET outcome = $1
                    WHERE bout_id = $2 AND fighter_id = $3`,
                    [fighter.outcome, boutId, fighterId]
                );

                if (updateResult.rowCount === 0) {
                    console.log(`Outcome record missing for fighter ${fighterId}, bout ${boutId}`);
                }

                // Fetch the fighter's latest career record from Cito
                const fighterResponse = await fetch(
                    `https://api.citoapi.com/api/v1/ufc/fighters/${fighter.fighterSlug}`,
                    {
                        headers: {
                            "X-API-KEY": process.env.CITO_API_KEY
                        }
                    }
                );

                if (!fighterResponse.ok) {
                    throw new Error(`Cito fighter API error: ${fighterResponse.status}`);
                }

                const fighterData = (await fighterResponse.json()).data;
                const winsByMethod = fighterData.stats.winsByMethod;

                // Update only the fighter's career record
                await pool.query(
                    `UPDATE fighters
                    SET career_wins = $1,
                        career_losses = $2,
                        career_draws = $3,
                        career_no_contests = $4,
                        knockout_wins = $5,
                        submission_wins = $6,
                        decision_wins = $7
                    WHERE id = $8`,
                    [
                        fighterData.recordWins,
                        fighterData.recordLosses,
                        fighterData.recordDraws,
                        fighterData.recordNoContest,
                        winsByMethod["ko-tko"].count,
                        winsByMethod.sub.count,
                        winsByMethod.dec.count,
                        fighterId
                    ]
                );
            }   

            // loop through fighters statistics for each bout
            for (const boutStat of bout.boutStats ?? []) {
                const fighterResult = await pool.query(
                    `SELECT id FROM fighters WHERE cito_slug = $1
                     UNION
                     SELECT fighter_id AS id FROM fighter_aliases WHERE cito_slug = $1`,
                    [boutStat.fighterSlug]
                );

                if (fighterResult.rows.length === 0) {
                    console.log(`Fighter not found: ${boutStat.fighterSlug}`);
                    continue;
                }

                const fighterId = fighterResult.rows[0].id;
                console.log(`Matched fighter ID: ${fighterId}`);

                const significantStrikes = splitStat(boutStat.significantStrikes);
                const totalStrikes = splitStat(boutStat.totalStrikes);
                const takedowns = splitStat(boutStat.takedowns);

                const updateResult = await pool.query(
                    `UPDATE bout_performance
                    SET knockdowns = $1,
                        significant_strikes_landed = $2,
                        significant_strikes_attempted = $3,
                        total_strikes_landed = $4,
                        total_strikes_attempted = $5,
                        takedowns_landed = $6,
                        takedowns_attempted = $7,
                        submission_attempts = $8,
                        reversals = $9,
                        control_time = $10
                    WHERE bout_id = $11 AND fighter_id = $12`,
                    [
                        boutStat.knockdowns,
                        significantStrikes.landed,
                        significantStrikes.attempted,
                        totalStrikes.landed,
                        totalStrikes.attempted,
                        takedowns.landed,
                        takedowns.attempted,
                        boutStat.submissionAttempts,
                        boutStat.reversals,
                        timeToSeconds(boutStat.controlTime),
                        boutId,
                        fighterId
                    ]
                );

                if (updateResult.rowCount === 0) {
                    console.log(`No performance record found for fighter ${fighterId}, bout ${boutId}`);
                }
            }

            // loop through each fighter's statistics for each round
            for (const roundStat of bout.roundStats ?? []) {


                const fighterResult = await pool.query(
                    `SELECT id FROM fighters WHERE cito_slug = $1
                    UNION
                    SELECT fighter_id AS id FROM fighter_aliases WHERE cito_slug = $1`,
                    [roundStat.fighterSlug]
                );

                if (fighterResult.rows.length === 0) {
                    console.log(`Round fighter not found: ${roundStat.fighterSlug}`);
                    continue;
                }

                const fighterId = fighterResult.rows[0].id;

                const significantStrikes = splitStat(roundStat.significantStrikes);
                const totalStrikes = splitStat(roundStat.totalStrikes);
                const takedowns = splitStat(roundStat.takedowns);
                const head = splitStat(roundStat.head);
                const body = splitStat(roundStat.body);
                const leg = splitStat(roundStat.leg);
                const distance = splitStat(roundStat.distance);
                const clinch = splitStat(roundStat.clinch);
                const ground = splitStat(roundStat.ground);

                await pool.query(
                    `INSERT INTO round_performance (
                        bout_id, fighter_id, round, knockdowns,
                        significant_strikes_landed, significant_strikes_attempted,
                        total_strikes_landed, total_strikes_attempted,
                        takedowns_landed, takedowns_attempted,
                        submission_attempts, reversals, control_time,
                        head_strikes_landed, head_strikes_attempted,
                        body_strikes_landed, body_strikes_attempted,
                        leg_strikes_landed, leg_strikes_attempted,
                        distance_strikes_landed, distance_strikes_attempted,
                        clinch_strikes_landed, clinch_strikes_attempted,
                        ground_strikes_landed, ground_strikes_attempted
                    )
                    VALUES (${Array.from({ length: 25 }, (_, i) => `$${i + 1}`).join(", ")})
                    ON CONFLICT (bout_id, fighter_id, round)
                    DO UPDATE SET
                        knockdowns = EXCLUDED.knockdowns,
                        significant_strikes_landed = EXCLUDED.significant_strikes_landed,
                        significant_strikes_attempted = EXCLUDED.significant_strikes_attempted,
                        total_strikes_landed = EXCLUDED.total_strikes_landed,
                        total_strikes_attempted = EXCLUDED.total_strikes_attempted,
                        takedowns_landed = EXCLUDED.takedowns_landed,
                        takedowns_attempted = EXCLUDED.takedowns_attempted,
                        submission_attempts = EXCLUDED.submission_attempts,
                        reversals = EXCLUDED.reversals,
                        control_time = EXCLUDED.control_time,
                        head_strikes_landed = EXCLUDED.head_strikes_landed,
                        head_strikes_attempted = EXCLUDED.head_strikes_attempted,
                        body_strikes_landed = EXCLUDED.body_strikes_landed,
                        body_strikes_attempted = EXCLUDED.body_strikes_attempted,
                        leg_strikes_landed = EXCLUDED.leg_strikes_landed,
                        leg_strikes_attempted = EXCLUDED.leg_strikes_attempted,
                        distance_strikes_landed = EXCLUDED.distance_strikes_landed,
                        distance_strikes_attempted = EXCLUDED.distance_strikes_attempted,
                        clinch_strikes_landed = EXCLUDED.clinch_strikes_landed,
                        clinch_strikes_attempted = EXCLUDED.clinch_strikes_attempted,
                        ground_strikes_landed = EXCLUDED.ground_strikes_landed,
                        ground_strikes_attempted = EXCLUDED.ground_strikes_attempted`,
                    [
                        boutId, fighterId, roundStat.round, roundStat.knockdowns,
                        significantStrikes.landed, significantStrikes.attempted,
                        totalStrikes.landed, totalStrikes.attempted,
                        takedowns.landed, takedowns.attempted,
                        roundStat.submissionAttempts, roundStat.reversals,
                        timeToSeconds(roundStat.controlTime),
                        head.landed, head.attempted,
                        body.landed, body.attempted,
                        leg.landed, leg.attempted,
                        distance.landed, distance.attempted,
                        clinch.landed, clinch.attempted,
                        ground.landed, ground.attempted
                    ]
                );

                console.log(
                    `Matched round ${roundStat.round}, fighter ${fighterId}, bout ${boutId}`
                );
            }
            
        }

        console.log(`Event updated successfully: ${eventSlug}`);

    } catch (error) {
        console.error("Event update failed: ", error);
    } finally {
        await pool.end()
    }
}

const eventSlug = process.argv[2];

updateEvent(eventSlug);