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
            decisions
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
    } = req.body;

    // validate the submitted weight class
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