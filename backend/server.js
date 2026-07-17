const express = require("express");
const app = express();
const cors = require("cors");
const { Pool } = require("pg");

app.use(express.json()); 
app.use(cors());

const pool = new Pool({
    database: "fighter_picker",
});

// HTTP endpoints : inside each endpoint we perform a database action

app.get("/fighters", async (req, res) => {
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
});

app.post("/fighters", async (req, res) => {
    const {
        firstName, 
        lastName,
        weightClass,
        submissions, 
        knockouts, 
        decisions,
    } = req.body;

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
    res.json(result.rows[0]);
});

app.delete("/fighters/:id", async (req, res) => {
    const { id } = req.params;

    await pool.query(
        `
        DELETE FROM fighters
        where id = $1
        `,
        [id]
    );
    res.sendStatus(204);
});

app.put("/fighters/:id", async (req, res) => {
    const { id } = req.params;

    const {
        firstName,
        lastName,
        weightClass,
        submissions,
        knockouts,
        decisions,
    } = req.body;

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
})

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});