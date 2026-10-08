require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(express.json()); 
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://fighter-picker.onrender.com"
    ]
}));

const weightClasses = [
    "Flyweight",
    "Bantamweight",
    "Featherweight",
    "Lightweight",
    "Welterweight",
    "Middleweight",
    "Light Heavyweight",
    "Heavyweight",
];

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// authenticate admin and generate access token
app.post("/admin/login", async (req, res) => {
    const { password } = req.body;

    const passwordMatches = await bcrypt.compare(
        password,
        process.env.ADMIN_PASSWORD_HASH
    );
    if (!passwordMatches) {
        return res.status(401).json({
            message: "Invalid password"
        });
    }
    const token = jwt.sign(
        { role : "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );
    res.json({ token });
});

function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Missing or invalid authorization header"
        });
    }
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

app.get("/admin/check", verifyAdmin, (req, res) => {
    res.json({ authenticated: true});
});

// get upcoming events and matchups for Home Page
app.get("/events/upcoming", async (req, res) => {
    try {
        const eventResult = await pool.query(
            `
            SELECT
                id,
                name,
                event_date AS "eventDate",
                cito_slug AS "citoSlug"
            FROM events
            WHERE event_date >= CURRENT_DATE
            ORDER BY event_date ASC
            LIMIT 1
            `
        );
        const event = eventResult.rows[0];

        if (!event) {
            return res.status(404).json({
                message: "No upcoming event found"
            });
        }

        const boutResult = await pool.query(
            `
            SELECT
                id,
                method, 
                result_round AS "resultRound",
                result_time AS "resultTime",
                card_section AS "cardSection",
                bout_order AS "boutOrder"
            FROM bouts
            WHERE event_id = $1
            ORDER BY bout_order;
            `,
            [event.id]
        );

        const fighterResult = await pool.query(
            `
            SELECT
                bout_performance.bout_id AS "boutId",
                fighters.id,
                fighters.first_name AS "firstName",
                fighters.last_name AS "lastName",
                fighters.weight_class AS "weightClass",
                fighters.career_wins AS "careerWins",
                fighters.career_losses AS "careerLosses",
                fighters.career_draws AS "careerDraws",
                fighters.image_url AS "imageUrl"
            FROM bout_performance
            JOIN fighters
                ON bout_performance.fighter_id = fighters.id
            WHERE bout_performance.bout_id = ANY($1)
            `,
            [boutResult.rows.map((bout) => bout.id)]
        );

        const bouts = boutResult.rows.map((bout) => ({
            ...bout,
            fighters: fighterResult.rows.filter(
                (fighter) => fighter.boutId === bout.id
            )
        }));

        res.json({
            ...event,
            bouts
        });

    } catch (error){
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

//  get list of past events for Events Page
app.get("/events", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                events.id,
                events.name,
                events.event_date AS "eventDate",
                events.cito_slug AS "citoSlug",
                STRING_AGG(
                    fighters.first_name || ' ' || fighters.last_name,
                    ' vs '
                ) AS "mainEvent"
            FROM events
            JOIN bouts
                ON bouts.event_id = events.id
                AND bouts.bout_order = 1001
            JOIN bout_performance
                ON bout_performance.bout_id = bouts.id
            JOIN fighters
                ON fighters.id = bout_performance.fighter_id
            WHERE events.event_date < CURRENT_DATE
            GROUP BY events.id
            ORDER BY events.event_date DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// get individual event for the Event Profile
app.get("/events/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const eventResult = await pool.query(`
            SELECT
                id,
                name,
                event_date AS "eventDate"
            FROM events
            WHERE id = $1
        `, [id]);

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        const boutResult = await pool.query(`
            SELECT
                id,
                method,
                result_round AS "resultRound",
                result_time AS "resultTime",
                card_section AS "cardSection",
                bout_order AS "boutOrder"
            FROM bouts
            WHERE event_id = $1
            ORDER BY bout_order
        `, [id]);
        
        const fighterResult = await pool.query(`
            SELECT
                bout_performance.bout_id AS "boutId",
                fighters.id,
                fighters.first_name AS "firstName",
                fighters.last_name AS "lastName"
            FROM bout_performance
            JOIN fighters
                ON bout_performance.fighter_id = fighters.id
            WHERE bout_performance.bout_id = ANY($1)
        `, [boutResult.rows.map((bout) => bout.id)]);

        const bouts = boutResult.rows.map((bout) => ({
            ...bout,
            fighters: fighterResult.rows.filter(
                (fighter) => fighter.boutId === bout.id
            )
        }));

        res.json({
            ...eventResult.rows[0],
            bouts
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch event" });
    }
});

// get fighters for Fighter Library with optional weight class filter
app.get("/fighters", async (req, res) => {
    try {
        const { weightClass } = req.query;
        const result = await pool.query(
        `
        SELECT 
            id,
            first_name AS "firstName",
            last_name AS "lastName",
            weight_class AS "weightClass",
            country,
            submission_wins AS "submissionWins",
            knockout_wins AS "knockoutWins", 
            decision_wins AS "decisionWins",
            height,
            reach,
            stance,
            age,
            strikes_per_min AS "strikesPerMin",
            striking_accuracy AS "strikingAccuracy",
            strikes_absorbed_per_min AS "strikesAbsorbedPerMin",
            striking_defence AS "strikingDefence",
            takedowns_per_15_min AS "takedownsPer15Min",
            takedown_accuracy AS "takedownAccuracy",
            takedown_defence AS "takedownDefence",
            submissions_per_15_min AS "submissionsPer15Min",
            career_wins AS "careerWins",
            career_losses As "careerLosses",
            career_draws AS "careerDraws",
            career_no_contests AS "careerNoContests", 
            image_url AS "imageUrl"
        FROM fighters
        WHERE ($1::text IS NULL OR weight_class = $1)
        ORDER BY last_name
        `, [weightClass || null]
    );

    res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
});

// get individual fighter profile and UFC wins
app.get("/fighters/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // retrieve individual fighter by id
        const result = await pool.query(
            `
            SELECT
                id, 
                first_name AS "firstName",
                last_name AS "lastName",
                weight_class AS "weightClass",
                country,
                submission_wins AS "submissionWins",
                knockout_wins AS "knockoutWins",
                decision_wins AS "decisionWins",
                height,
                reach,
                stance,
                age,
                strikes_per_min AS "strikesPerMin",
                striking_accuracy AS "strikingAccuracy",
                strikes_absorbed_per_min AS "strikesAbsorbedPerMin",
                striking_defence AS "strikingDefence",
                takedowns_per_15_min AS "takedownsPer15Min",
                takedown_accuracy AS "takedownAccuracy",
                takedown_defence AS "takedownDefence",
                submissions_per_15_min AS "submissionsPer15Min",
                career_wins AS "careerWins",
                career_losses AS "careerLosses",
                career_draws AS "careerDraws",
                career_no_contests AS "careerNoContests",
                image_url AS "imageUrl"
            FROM fighters
            WHERE id = $1
            `,
            [id]
        );

        const winsResult = await pool.query(
            `
            SELECT COUNT(*) AS wins
            FROM bout_performance
            WHERE fighter_id = $1
                AND outcome = 'win'
            `,
            [id]
        )
        res.json({
            ...result.rows[0],
            wins: Number(winsResult.rows[0].wins)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
})

app.get("/fighters/:id/history", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                fighter_performance.outcome,
                bouts.id AS "boutId",
                opponent.id AS "opponentId",
                opponent.first_name AS "opponentFirstName",
                opponent.last_name as "opponentLastName",
                events.name,
                events.event_date AS "eventDate",
                bouts.method,
                bouts.result_round AS "resultRound",
                bouts.result_time AS "resultTime",
                fighter_performance.knockdowns,
                fighter_performance.total_strikes_landed AS "totalStrikesLanded",
                fighter_performance.takedowns_landed AS "takedownsLanded",
                fighter_performance.submission_attempts AS "submissionAttempts"
            FROM bout_performance AS fighter_performance
            JOIN bout_performance as opponent_performance
            ON fighter_performance.bout_id = opponent_performance.bout_id
            AND fighter_performance.fighter_id != opponent_performance.fighter_id
            JOIN bouts
            ON fighter_performance.bout_id = bouts.id
            JOIN events
            ON bouts.event_id = events.id
            JOIN fighters AS opponent
            ON opponent_performance.fighter_id = opponent.id
            WHERE fighter_performance.fighter_id = $1
            ORDER BY events.event_date DESC;
            `,
            [id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// get individual fighter's UFC fight history
app.get("/bouts/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                bouts.id,
                events.name AS "eventName",
                events.event_date AS "eventDate",
                method,
                result_round AS "resultRound",
                result_time AS "resultTime"
            FROM bouts
            JOIN events
            ON bouts.event_id = events.id
            WHERE bouts.id = $1
            `,
            [id]
        );

        const fighterResult = await pool.query(
            `
            SELECT 
                fighters.id,
                fighters.first_name AS "firstName",
                fighters.last_name AS "lastName",
                bout_performance.outcome
            FROM bout_performance
            JOIN fighters
            ON bout_performance.fighter_id = fighters.id
            WHERE bout_performance.bout_id = $1
            `,
            [id]
        );

        const roundResult = await pool.query(
            `
            SELECT 
                fighter_id AS "fighterId",
                round,
                knockdowns,
                significant_strikes_landed AS "significantStrikesLanded",
                significant_strikes_attempted AS "significantStrikesAttempted",
                total_strikes_landed AS "totalStrikesLanded",
                total_strikes_attempted AS "totalStrikesAttempted",
                takedowns_landed AS "takedownsLanded",
                takedowns_attempted AS "takedownsAttempted",
                submission_attempts AS "submissionAttempts",
                reversals,
                control_time AS "controlTime",
                head_strikes_landed AS "headStrikesLanded",
                head_strikes_attempted AS "headStrikesAttempted",
                body_strikes_landed AS "bodyStrikesLanded",
                body_strikes_attempted AS "bodyStrikesAttempted",
                leg_strikes_landed AS "legStrikesLanded",
                leg_strikes_attempted AS "legStrikesAttempted",
                distance_strikes_landed AS "distanceStrikesLanded",
                distance_strikes_attempted AS "distanceStrikesAttempted",
                clinch_strikes_landed AS "clinchStrikesLanded",
                clinch_strikes_attempted AS "clinchStrikesAttempted",
                ground_strikes_landed AS "groundStrikesLanded",
                ground_strikes_attempted AS "groundStrikesAttempted"
            FROM round_performance
            WHERE bout_id = $1
            ORDER BY round, fighter_id
            `,
            [id]
        );
        res.json({
            ...result.rows[0],
            fighters: fighterResult.rows,
            rounds: roundResult.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// delete individual fighter (admin only)
app.delete("/fighters/:id", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            DELETE FROM fighters
            WHERE id = $1
            `,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Fighter not found"
            });
        }

        res.sendStatus(204);
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Internal server error"
            });
    }
});

// update individual fighter's details (admin only)
app.put("/fighters/:id", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params; 

        const {
            firstName,
            lastName,
            weightClass,
            country,
            submissionWins,
            knockoutWins,
            decisionWins,
            height,
            reach,
            stance,
            age,
            careerWins,
            careerLosses,
            careerDraws,
            careerNoContests,
            strikesPerMin,
            strikingAccuracy,
            strikesAbsorbedPerMin,
            strikingDefence,
            takedownsPer15Min,
            takedownAccuracy,
            takedownDefence,
            submissionsPer15Min
        } = req.body; 

        if (!weightClasses.includes(weightClass)){ 
            return res.status(400).json({
                message: "Invalid weight class",
            });
        } 

        const result = await pool.query( 
            `
            UPDATE fighters
            SET
                first_name = $1, 
                last_name = $2, 
                weight_class = $3, 
                submission_wins = $4, 
                knockout_wins = $5, 
                decision_wins = $6,
                height = $7,
                reach = $8,
                stance = $9,
                age = $10,
                career_wins = $11,
                career_losses = $12,
                career_draws = $13,
                career_no_contests = $14,
                strikes_per_min = $15,
                striking_accuracy = $16,
                strikes_absorbed_per_min = $17,
                striking_defence = $18,
                takedowns_per_15_min = $19,
                takedown_accuracy = $20,
                takedown_defence = $21,
                submissions_per_15_min = $22,
                country = $24
            WHERE id = $23
            RETURNING
                id, 
                first_name AS "firstName",
                last_name AS "lastName", 
                weight_class AS "weightClass",
                submission_wins AS "submissionWins", 
                knockout_wins AS "knockoutWins", 
                decision_wins AS "decisionWins", 
                height,
                reach,
                stance,
                age, 
                career_wins AS "careerWins",
                career_losses AS "careerLosses",
                career_draws AS "careerDraws",
                career_no_contests AS "careerNoContests",
                strikes_per_min AS "strikesPerMin",
                striking_accuracy AS "strikingAccuracy",
                strikes_absorbed_per_min AS "strikesAbsorbedPerMin",
                striking_defence AS "strikingDefence",
                takedowns_per_15_min AS "takedownsPer15Min",
                takedown_accuracy AS "takedownAccuracy",
                takedown_defence AS "takedownDefence",
                submissions_per_15_min AS "submissionsPer15Min",
                country
            `,
            [
                firstName, 
                lastName,
                weightClass,
                submissionWins,
                knockoutWins,
                decisionWins,
                height,
                reach,
                stance,
                age,
                careerWins,
                careerLosses,
                careerDraws,
                careerNoContests,
                strikesPerMin,
                strikingAccuracy,
                strikesAbsorbedPerMin,
                strikingDefence,
                takedownsPer15Min,
                takedownAccuracy,
                takedownDefence,
                submissionsPer15Min,
                id,
                country
            ]
        );

        if (result.rows.length ===0){ 
            return res.status(404).json({
                message: "Fighter not found" 
            });
        } 

        res.json(result.rows[0]);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
})

// start Express server
const PORT = process.env.PORT  ||  3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});