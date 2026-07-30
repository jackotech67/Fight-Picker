const express = require("express");
const app = express();
const cors = require("cors");
const { Pool } = require("pg");

app.use(express.json()); 
app.use(cors());

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
    database: "fighter_picker",
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
            submissions,
            knockouts, 
            decisions,
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
                submissions,
                knockouts,
                decisions,
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
            FROM fight_performance
            WHERE fighter_id = $1
                AND is_winner = TRUE
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
                fight_performance.is_winner,
                fights.id AS fight_id,
                events.name,
                events.event_date,
                fights.method,
                fights.round,
                fights.time,
                fight_performance.knockdowns,
                fight_performance.strikes,
                fight_performance.takedowns,
                fight_performance.submissions
            FROM fight_performance
            JOIN fights
            ON fight_performance.fight_id = fights.id
            JOIN events
            ON fights.event_id = events.id
            WHERE fight_performance.fighter_id = $1;
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

app.post("/fighters", async (req, res) => {
    try {
        // extract fighter data from the request body
        const {
        firstName, 
        lastName,
        weightClass,
        submissions, 
        knockouts, 
        decisions,
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
    if (submissions < 0 || knockouts < 0 || decisions < 0) {
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
            submissions,
            knockouts,
            decisions,
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
            submissions,
            knockouts, 
            decisions,
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
            submissions,
            knockouts, 
            decisions,
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

app.delete("/fighters/:id", async (req, res) => {
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

app.put("/fighters/:id", async (req, res) => {
    try {
        // extract fighter id from the url and updated data from request
        const { id } = req.params; 

        const {
            firstName,
            lastName,
            weightClass,
            submissions,
            knockouts,
            decisions,
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
                submissions = $4, 
                knockouts = $5, 
                decisions = $6,
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
                submissions, 
                knockouts, 
                decisions, 
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
                submissions,
                knockouts,
                decisions,
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

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});