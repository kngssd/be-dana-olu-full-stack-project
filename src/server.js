import { app } from "./support/setupExpress.js";
import { query } from "./support/db.js";
//You should delete all of these route handlers and replace them according to your own requirements

app.get("/", (req, res) => {
    res.json({
        outcome: "success",
        message: "hello world from Dana and Olu!",
    });
});

app.get("/movies/search", async (req, res) => {
    const { searchTerm } = req.query;
    const dbResult = await query(
        "select * from movies where LOWER(name) like LOWER($1) order by name ASC limit 50;",
        [`%${searchTerm}%`]
    );
    res.json(dbResult.rows);
});

app.get("/movies/:id", async (req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        if (Number.isNaN(targetId)) {
            res.status(400).json({ error: "Bad request" });
            return;
        }

        const queryString =
            "select * from movies join movie_abstracts_en on movies.id = movie_abstracts_en.movie_id where movies.id = $1;";

        const dbResult = await query(queryString, [targetId]);

        if (dbResult.rowCount === 0) {
            res.status(404).json({ error: "Movie not found" });
            return;
        }

        res.json(dbResult.rows);
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error });
    }
});

// use the environment variable PORT, or 4000 as a fallback
const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
    console.log(
        `Your express app started listening on ${PORT}, at ${new Date()}`
    );
});
