import { app } from "./support/setupExpress.js";
import { query } from "./support/db.js";
import { setupARouteHandlerDemonstratingValidationWithZod } from "./zodDemo/setupARouteHandlerDemonstratingValidationWithZod.js";

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
        "select * from movies where LOWER(name) like LOWER($1) limit 50;",
        [`%${searchTerm}%`]
    );
    res.json(dbResult.rows);
});

//This jsdoc comment helps vscode figure out the correct types for req and res for autocompletion, etc,
//when it can't figure it out from context.
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

//An example route that makes an SQL query to the db.
app.get("/db-check", async (req, res) => {
    try {
        const dbResult = await query("select * from my_table");
        res.json(dbResult.rows);
    } catch (error) {
        console.error("error handling db-check: ", error);
        //don't forget to send a response back to the client!
        res.status(500).json({ outcome: "error", message: "see server logs" });
    }
});

//Delete this, too.  It's just a demo for one way to robustly validate user-submitted data.
setupARouteHandlerDemonstratingValidationWithZod(app);

// use the environment variable PORT, or 4000 as a fallback
const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
    console.log(
        `Your express app started listening on ${PORT}, at ${new Date()}`
    );
});
