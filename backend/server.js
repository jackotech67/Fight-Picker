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

// HTTP endpoints : inside each endpoint we perform a database action

app.get("/fighters", async (req, res) => {
    try {
        const result = await pool.query(
        `
        SELECT 
            id,
            first_name AS "firstName",
            last_name AS "lastName",
            weight_class AS "weightClass",
            submissions,
            knockouts, 
            decisions
        FROM fighters
        `
    );
    res.json(result.rows);
    } catch (error) {
        console.error(error);
        
        res.status(500).json({
            message: "Internal server error"
        })
    }
});

app.post("/fighters", async (req, res) => {
    try {
        const {
        firstName, 
        lastName,
        weightClass,
        submissions, 
        knockouts, 
        decisions,
    } = req.body;

    if (!weightClasses.includes(weightClass)){
        return res.status(400).json({
            message: "Invalid weight class",
        });
    }

    const result = await pool.query(
        `
        INSERT INTO fighters (
            first_name,
            last_name,
            weight_class,
            submissions,
            knockouts,
            decisions
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            first_name AS "firstName",
            last_name AS "lastName",
            weight_class AS "weightClass",
            submissions,
            knockouts, 
            decisions    
        `,
        [
            firstName,
            lastName,
            weightClass,
            submissions,
            knockouts, 
            decisions,
        ]
    );
    res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.delete("/fighters/:id", async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            `
            DELETE FROM fighters
            WHERE id = $1
            `,
            [id]
        );
        res.sendStatus(204);
        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Internal server error"
            });
    }
});

app.put("/fighters/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            firstName,
            lastName,
            weightClass,
            submissions,
            knockouts,
            decisions,
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
                submissions = $4, 
                knockouts = $5, 
                decisions = $6
            WHERE id = $7
            RETURNING
                id, 
                first_name AS "firstName",
                last_name AS "lastName", 
                weight_class AS "weightClass",
                submissions, 
                knockouts, 
                decisions
            `,
            [
                firstName, 
                lastName,
                weightClass,
                submissions,
                knockouts,
                decisions,
                id,
            ]
        );
        res.json(result.rows[0]);
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