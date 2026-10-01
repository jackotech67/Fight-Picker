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

app.get("/cito-test", async (req, res) => {
    try {
        const response = await fetch(
            "https://api.citoapi.com/api/v1/ufc/bouts?hasStats=true&includeStats=true",
            {
                headers: {
                    "x-api-key": process.env.CITO_API_KEY
                }
            }
        );

        const data = await response.json();
        console.dir(data.data[0], { depth: null });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch Cito data"});
    }
})

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

    if (!authHeader) {
        return res.status(401).json({
            message: "No token provided"
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

app.get("/fighters", async (req, res) => {
    try {
        // retrieve all fighters from the database
        const result = await pool.query(
        `
        SELECT 
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
            career_no_contests AS "careerNoContests"
        FROM fighters
        `
    );

    // return the list of fighters
    res.json(result.rows);

    // handle unexpected server or database errors
    } catch (error) {
        console.error(error);
        
        res.status(500).json({
            message: "Internal server error"
        })
    }
});

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
                career_no_contests AS "careerNoContests"
            FROM fighters
            WHERE id = $1
            `,
            [id]
        );

        const winsResult = await pool.query(
            `
            SELECT COUNT(*) AS wins
            FROM fighter_performance
            WHERE fighter_id = $1
                AND outcome = 'win'
            `,
            [id]
        )

        // return the fighter
        res.json({
            ...result.rows[0],
            wins: Number(winsResult.rows[0].wins)
        });

    // handle unexpected server or database errors
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

app.post("/fighters", verifyAdmin, async (req, res) => {
    try {
        // extract fighter data from the request body
        const {
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
        submissionsPer15Min
    } = req.body;

    // validate submitted data
    if (firstName.trim() === "" || lastName.trim() === "") {
        return res.status(400).json({
            message: "First and last name are required.",
        })
    }
    if (submissionWins < 0 || knockoutWins < 0 || decisionWins < 0) {
        return res.status(400).json({
            message: "Stats cannot be negative"
        })
    }
    if (!weightClasses.includes(weightClass)){
        return res.status(400).json({
            message: "Invalid weight class",
        });
    }

    // insert the new fighter into the database
    const result = await pool.query(
        `
        INSERT INTO fighters (
            first_name,
            last_name,
            weight_class,
            submission_wins,
            knockout_wins,
            decision_wins,
            height,
            reach, 
            stance,
            age,    
            career_wins,
            career_losses,
            career_draws,
            career_no_contests,
            strikes_per_min,
            striking_accuracy,
            strikes_absorbed_per_min,
            striking_defence,
            takedowns_per_15_min,
            takedown_accuracy,
            takedown_defence,
            submissions_per_15_min
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
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
            submissions_per_15_min AS "submissionsPer15Min"
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
            submissionsPer15Min
        ]
    );

    // return the newly created fighter
    res.status(201).json(result.rows[0]);

    // handle unexpected server or database errors
    } catch (error) {
        console.error(error);
        
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.delete("/fighters/:id", verifyAdmin, async (req, res) => {
    try {
        // extract fighter id from the request url
        const { id } = req.params;

        // delete the fighter from the database
        const result = await pool.query(
            `
            DELETE FROM fighters
            WHERE id = $1
            `,
            [id]
        );

        // check whether a fighter with this id existed
        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Fighter not found"
            });
        }

        // confirm the fighter was sucessfully deleted
        res.sendStatus(204);

        // handle unexpected server or database errors
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Internal server error"
            });
    }
});

app.put("/fighters/:id", verifyAdmin, async (req, res) => {
    try {
        // extract fighter id from the url and updated data from request
        const { id } = req.params; 

        const {
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
            submissionsPer15Min
        } = req.body; 

        // validate the data request before accessing the database
        if (!weightClasses.includes(weightClass)){ 
            return res.status(400).json({
                message: "Invalid weight class",
            });
        } 

        // update the fighter and return the updated record
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
                submissions_per_15_min = $22
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
                submissions_per_15_min AS "submissionsPer15Min"
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
                id
            ]
        );

        // if no rows updated, the fighter does not exist
        if (result.rows.length ===0){ 
            return res.status(404).json({
                message: "Fighter not found" 
            });
        } 

        // return updated fighter to frontend
        res.json(result.rows[0]);

    // handle unexpected server or database errors    
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
})

const PORT = process.env.PORT  ||  3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});