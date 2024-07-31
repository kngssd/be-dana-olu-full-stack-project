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
            "select * from movies left join movie_abstracts_en on movies.id = movie_abstracts_en.movie_id where movies.id = $1;";

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

app.post("/movies/:id/comments", async (req, res) => {
    try {
        const commentBody = req.body;
        const movieID = parseInt(req.params.id);
        const queryString =
            "INSERT INTO comments (movie_id, comment_text, author) VALUES ($1, $2, $3) RETURNING *";

        const dbResult = await query(queryString, [
            movieID,
            commentBody.comment_text,
            commentBody.author,
        ]);

        res.json(dbResult.rows);
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.get("/movies/:id/comments", async (req, res) => {
    try {
        const movieID = parseInt(req.params.id);
        const queryString = "SELECT * FROM comments WHERE movie_id = $1";

        const dbResult = await query(queryString, [movieID]);
        res.json(dbResult.rows);
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.get("/comments", async (req, res) => {
    try {
        const queryString = "SELECT * FROM comments";

        const dbResult = await query(queryString);
        res.json(dbResult.rows);
    } catch (error) {
        res.status(500).json({ error });
    }
});

app.get("/comments/:id", async (req, res) => {
    try {
        const commentID = parseInt(req.params.id);
        if (Number.isNaN(commentID)) {
            res.status(400).json({ error: "Bad request" });
            return;
        }
        const queryString = "SELECT * FROM comments where comment_id = $1";

        const dbResult = await query(queryString, [commentID]);

        if (dbResult.rowCount === 0) {
            res.status(404).json({ error: "Comment not found" });
            return;
        }

        res.json(dbResult.rows);
    } catch (error) {
        res.status(500).json({ error });
    }
});

// use the environment variable PORT, or 4000 as a fallback
const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
    console.log(
        `Your express app started listening on ${PORT}, at ${new Date()}`
    );
});
