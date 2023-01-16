const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
const { body, validationResult } = require("express-validator");
const { render } = require("ejs");

router.post("/addCitation/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)-[:EDITED_BY]->(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                MERGE (selectedFragment:SelectedFragment {value: "${req.body.selectedFragment}", chapter: "${req.body.chapter}", stanzaStart: "${req.body.stanzaStart}", padaStart: "${req.body.padaStart}", stanzaEnd: "${req.body.stanzaEnd}", padaEnd: "${req.body.padaEnd}"})
                MERGE (edition)-[:HAS_FRAGMENT]->(selectedFragment)
                MERGE (citation:Citation {value: '${req.body.citation}', stanzaStart: "${req.body.stanzaStart}", padaStart: "${req.body.padaStart}", stanzaEnd: "${req.body.stanzaEnd}", padaEnd: "${req.body.padaEnd}"})
                MERGE (selectedFragment)-[:IS_A_CITATION_OF]->(citation)
                RETURN *
                `
            )
            .subscribe({
                onNext: () => {
                    res.redirect(`../edit/${idEdition}-${idEditor}`);
                },
                onCompleted: () => {
                    console.log("Data added to the graph");
                },
                onError: err => {
                    console.log("Error related to the upload to Neo4j: " + err)
                }
            })
        );
    } catch (err) {
        console.log("Error related to Neo4j in adding the translation: " + err);
    } finally {
        await session.close();
    };
});

module.exports = router;