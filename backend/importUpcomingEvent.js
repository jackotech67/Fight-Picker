// DATABASE CONNECTION
require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

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

async function importCitoData() {
    
    //FETCH UPCOMING EVENT FROM CITO
    const response = await fetch(
        "https://api.citoapi.com/api/v1/ufc/events/upcoming",
        {
            headers: {
                "X-API-KEY": process.env.CITO_API_KEY
            }
        }
    );
    const result = await response.json();
    const events = result.data;

    const event = events[0];
    console.log(
        event.title,
        event.eventDate,
        event.id,
        event.slug
    );

    // INSERT / UPDATE EVENT IN DATABASE
    const insertedEvent = await pool.query(
        `
        INSERT INTO events (name, event_date, cito_id, cito_slug)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (cito_slug)
        DO UPDATE SET
            name = EXCLUDED.name,
            event_date = EXCLUDED.event_date,
            cito_id = EXCLUDED.cito_id
        RETURNING *     
        `,
        [event.title, event.eventDate, event.id, event.slug]
    );
    const eventId = insertedEvent.rows[0].id;

    // FETCH EVENT BOUTS FROM CITO
    const boutResponse = await fetch(
        `https://api.citoapi.com/api/v1/ufc/events/${event.slug}/bouts`,
        {
            headers: {
                "X-API-KEY": process.env.CITO_API_KEY
            }
        }
    );
    const boutResult = await boutResponse.json();
    const bouts = boutResult.data;

    for (const bout of bouts) {
        // INSERT / UPDATE EACH BOUT IN DATABASE
        const insertedBout = await pool.query(
            `
            INSERT INTO bouts (event_id, method, result_round, result_time, cito_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (cito_id)
            DO UPDATE SET
                event_id = EXCLUDED.event_id,
                method = EXCLUDED.method,
                result_round = EXCLUDED.result_round,
                result_time = EXCLUDED.result_time
                RETURNING id
            `,
            [eventId, bout.method, bout.resultRound, bout.resultTime, bout.id]
        );
        const boutId = insertedBout.rows[0].id;
        for (const fighter of bout.fighters) {
            // console.log(
            //     fighter.fighterName,
            //     fighter.fighterSlug,
            //     fighter.fighterId
            // );
            // FETCH EACH FIGHTER PROFILE FROM CITO
            const fighterResponse = await fetch(
                `https://api.citoapi.com/api/v1/ufc/fighters/${fighter.fighterSlug}`,
                {
                    headers: {
                        "X-API-KEY": process.env.CITO_API_KEY
                    }
                }
            );
            const fighterResult = await fighterResponse.json();
            const fighterProfile = fighterResult.data;

            if (!fighterProfile) {
                console.log("No profile returned for:", fighter.fighterSlug, fighterResult);
                continue;
            }

            // PREPARE FIGHTER STATS
            const stats = fighterProfile.stats;
            const winsByMethod = stats?.winsByMethod;

            const submissionWins = winsByMethod?.sub?.count ?? 0;
            const knockoutWins = winsByMethod?.["ko-tko"]?.count ?? 0;
            const decisionWins = winsByMethod?.dec?.count ?? 0;

            // INSERT UPDATE FIGHTER IN DATABASE
            const insertedFighter = await pool.query(
                `
                INSERT INTO fighters (
                    first_name,
                    last_name,
                    weight_class,
                    height,
                    reach,
                    stance,
                    age,
                    strikes_per_min,
                    striking_accuracy,
                    strikes_absorbed_per_min,
                    striking_defence, 
                    takedowns_per_15_min,
                    takedown_accuracy,
                    takedown_defence,
                    submissions_per_15_min,
                    submission_wins,
                    knockout_wins,
                    decision_wins,
                    career_wins,
                    career_losses,
                    career_draws,
                    career_no_contests,
                    cito_id,
                    cito_slug
                )
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, 
                    $9, $10, $11, $12, $13, $14, $15, $16,
                    $17, $18, $19, $20, $21, $22, $23, $24
                    )
                ON CONFLICT (cito_slug)
                DO UPDATE SET
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    weight_class = EXCLUDED.weight_class,
                    height = EXCLUDED.height,
                    reach = EXCLUDED.reach,
                    stance = EXCLUDED.stance,
                    age = EXCLUDED.age,
                    strikes_per_min = EXCLUDED.strikes_per_min,
                    striking_accuracy = EXCLUDED.striking_accuracy,
                    strikes_absorbed_per_min = EXCLUDED.strikes_absorbed_per_min,
                    striking_defence = EXCLUDED.striking_defence,
                    takedowns_per_15_min = EXCLUDED.takedowns_per_15_min,
                    takedown_accuracy = EXCLUDED.takedown_accuracy,
                    takedown_defence = EXCLUDED.takedown_defence,
                    submissions_per_15_min = EXCLUDED.submissions_per_15_min,
                    submission_wins = EXCLUDED.submission_wins,
                    knockout_wins = EXCLUDED.knockout_wins,
                    decision_wins = EXCLUDED.decision_wins,
                    career_wins = EXCLUDED.career_wins,
                    career_losses = EXCLUDED.career_losses,
                    career_draws = EXCLUDED.career_draws,
                    career_no_contests = EXCLUDED.career_no_contests,
                    cito_id = EXCLUDED.cito_id
                RETURNING *
                `,
                [
                    fighterProfile.firstName,
                    fighterProfile.lastName,
                    fighterProfile.division,
                    fighterProfile.heightInches,
                    fighterProfile.reachInches,
                    fighterProfile.stance,
                    fighterProfile.age,
                    stats?.sigStrikesLandedPerMin,
                    stats?.strikingAccuracy,
                    stats?.sigStrikesAbsorbedPerMin,
                    stats?.sigStrikeDefense,
                    stats?.takedownAvgPer15Min,
                    stats?.takedownAccuracy,
                    stats?.takedownDefense,
                    stats?.submissionAvgPer15Min,
                    submissionWins,
                    knockoutWins,
                    decisionWins,
                    fighterProfile.recordWins,
                    fighterProfile.recordLosses,
                    fighterProfile.recordDraws,
                    fighterProfile.recordNoContest,
                    fighterProfile.id,
                    fighterProfile.slug
                ]
            );
            const fighterId = insertedFighter.rows[0].id;

            // PREPARE FIGHTER BOUT PERFORMANCE
            const boutStats = bout.boutStats.find(
                stat => stat.fighterSlug === fighter.fighterSlug
            );
            if (boutStats) {
                const significantStrikes = splitStat(boutStats.significantStrikes);
                const totalStrikes = splitStat(boutStats.totalStrikes);
                const takedowns = splitStat(boutStats.takedowns);

                await pool.query(
                    `
                    INSERT INTO bout_performance (
                        bout_id,
                        fighter_id,
                        outcome,
                        knockdowns,
                        significant_strikes_landed,
                        significant_strikes_attempted,
                        total_strikes_landed,
                        total_strikes_attempted,
                        takedowns_landed,
                        takedowns_attempted,
                        submission_attempts,
                        reversals,
                        control_time
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    ON CONFLICT (bout_id, fighter_id)
                    DO UPDATE SET
                        outcome = EXCLUDED.outcome,
                        knockdowns = EXCLUDED.knockdowns,
                        significant_strikes_landed = EXCLUDED.significant_strikes_landed,
                        significant_strikes_attempted = EXCLUDED.significant_strikes_attempted,
                        total_strikes_landed = EXCLUDED.total_strikes_landed,
                        total_strikes_attempted = EXCLUDED.total_strikes_attempted,
                        takedowns_landed = EXCLUDED.takedowns_landed,
                        takedowns_attempted = EXCLUDED.takedowns_attempted,
                        submission_attempts = EXCLUDED.submission_attempts,
                        reversals = EXCLUDED.reversals,
                        control_time = EXCLUDED.control_time
                    `,
                    [
                        boutId,
                        fighterId,
                        fighter.outcome,
                        boutStats.knockdowns,
                        significantStrikes.landed,
                        significantStrikes.attempted,
                        totalStrikes.landed,
                        totalStrikes.attempted,
                        takedowns.landed,
                        takedowns.attempted,
                        boutStats.submissionAttempts,
                        boutStats.reversals,
                        timeToSeconds(boutStats.controlTime)
                    ]
                );
            }

            // PREPARE FIGHTER ROUND PERFORMANCE
            const fighterRoundStats = bout.roundStats.filter(
                stat => stat.fighterSlug === fighter.fighterSlug
            );
            for (const roundStat of fighterRoundStats) {
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
                    `
                    INSERT INTO round_performance (
                        bout_id,
                        fighter_id,
                        round,
                        knockdowns,
                        significant_strikes_landed,
                        significant_strikes_attempted,
                        total_strikes_landed,
                        total_strikes_attempted,
                        takedowns_landed,
                        takedowns_attempted,
                        submission_attempts,
                        reversals,
                        control_time,
                        head_strikes_landed,
                        head_strikes_attempted,
                        body_strikes_landed,
                        body_strikes_attempted,
                        leg_strikes_landed,
                        leg_strikes_attempted,
                        distance_strikes_landed,
                        distance_strikes_attempted,
                        clinch_strikes_landed,
                        clinch_strikes_attempted,
                        ground_strikes_landed,
                        ground_strikes_attempted
                    )
                    VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, $10,
                        $11, $12, $13, $14, $15,
                        $16, $17, $18, $19, $20,
                        $21, $22, $23, $24, $25
                    )
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
                        ground_strikes_attempted = EXCLUDED.ground_strikes_attempted
                    `,
                    [
                        boutId,
                        fighterId,
                        roundStat.round,
                        roundStat.knockdowns,
                        significantStrikes.landed,
                        significantStrikes.attempted,
                        totalStrikes.landed,
                        totalStrikes.attempted,
                        takedowns.landed,
                        takedowns.attempted,
                        roundStat.submissionAttempts,
                        roundStat.reversals,
                        timeToSeconds(roundStat.controlTime),
                        head.landed,
                        head.attempted,
                        body.landed,
                        body.attempted,
                        leg.landed,
                        leg.attempted,
                        distance.landed,
                        distance.attempted,
                        clinch.landed,
                        clinch.attempted,
                        ground.landed,
                        ground.attempted
                    ]
                );
            }
        }
        
    }
}

module.exports = importCitoData;