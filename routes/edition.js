const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

router.get("/edition/:id", async (req, res) => {
    const idEdition = req.originalUrl.split("/").pop().split("-")[0];
    const idEditor = req.originalUrl.split("/").pop().split("-")[1]; 
    const session = driver.session();
    try {
        const data = await session.readTransaction(tx => tx
            .run(
                `
                MATCH (file:File)-[:PRODUCED_BY]->(editor:Editor)<-[:EDITED_BY]-(edition:Edition)<-[:HAS_MANIFESTATION]-(work:Work)-[:WRITTEN_BY]->(author:Author)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                RETURN edition.title, author.name, editor.name, file.name, ID(edition), ID(editor)
                `
            )
        );
        res.render("edition", {
            edition: data.records.map(row => {
                const results = row["_fields"];
                return results;
            }),
            file: data.records.map(row => {
                const results = row["_fields"][3];
                return results;
            }),
        });
    } catch (err) {
        console.log("Error related to the upload of the editions: " + err);
    } finally {
        await session.close();
    };
});

module.exports = router;