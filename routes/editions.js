const express = require("express");
const bodyParser = require("body-parser");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

router.get("/editions", async (req, res) => {
    const session = driver.session();
    try {
        const data = await session.readTransaction(tx => tx
            .run("MATCH (work:Work)-[w:WRITTEN_BY]->(author:Author) MATCH (edition:Edition)-[e:EDITED_BY]->(editor:Editor) MATCH (file:File)-[p:PRODUCED_BY]->(editor:Editor) RETURN edition.title, author.name, editor.name, ID(edition), ID(editor), file.name ORDER BY edition.title, editor.name")
        );
        res.render("editions", {
            editions: data.records.map(row => {
                const results = row["_fields"];
                return results;
            })
        });
    } catch (err) {
        console.log("Error related to the upload of the editions: " + err);
    } finally {
        await session.close();
    };
});

module.exports = router;