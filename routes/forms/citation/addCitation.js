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
                MERGE (selectedFragment:SelectedFragment {idAnnotation: "${req.body.idAnnotation}"})
                ON CREATE
                    SET selectedFragment.value = "${req.body.selectedFragment}", selectedFragment.chapter = "${req.body.chapter}", selectedFragment.stanzaStart = "${req.body.stanzaStart}", selectedFragment.padaStart = "${req.body.padaStart}", selectedFragment.stanzaEnd = "${req.body.stanzaEnd}", selectedFragment.padaEnd = "${req.body.padaEnd}"
                ON MATCH
                    SET selectedFragment.value = "${req.body.selectedFragment}", selectedFragment.chapter = "${req.body.chapter}", selectedFragment.stanzaStart = "${req.body.stanzaStart}", selectedFragment.padaStart = "${req.body.padaStart}", selectedFragment.stanzaEnd = "${req.body.stanzaEnd}", selectedFragment.padaEnd = "${req.body.padaEnd}"
                MERGE (edition)-[:HAS_FRAGMENT]->(selectedFragment)
                MERGE (selectedFragment)-[:IS_A_CITATION_OF]->(citation:Citation {idAnnotation: "${req.body.idAnnotation}"})
                ON CREATE
                    SET citation.stanzaStart = "${req.body.stanzaStart}", citation.value = '${req.body.citation}'
                ON MATCH
                    SET citation.stanzaStart = "${req.body.stanzaStart}", citation.value = '${req.body.citation}'
                RETURN *
                `
            )
            .subscribe({
                onCompleted: () => {
                    console.log("Data added to the graph");
                },
                onError: err => {
                    console.log(err)
                }
            })
        );
    } catch (err) {
        console.log(err);
    } finally {
        await session.close();
        res.redirect(`../edit/${idEdition}-${idEditor}`);
    };
});

module.exports = router;