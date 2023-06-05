const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
const { body, validationResult } = require("express-validator");
const { render } = require("ejs");

router.post(process.env.URL_PATH + "/addParallel/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                MERGE (selectedFragment:SelectedFragment {idAnnotation: "${req.body.idAnnotation}"})
                ON CREATE
                    SET selectedFragment.value = "${req.body.selectedFragment}", selectedFragment.chapter = "${req.body.chapter}", selectedFragment.stanzaStart = "${req.body.stanzaStart}", selectedFragment.padaStart = "${req.body.padaStart}", selectedFragment.stanzaEnd = "${req.body.stanzaEnd}", selectedFragment.padaEnd = "${req.body.padaEnd}"
                ON MATCH
                    SET selectedFragment.value = "${req.body.selectedFragment}", selectedFragment.chapter = "${req.body.chapter}", selectedFragment.stanzaStart = "${req.body.stanzaStart}", selectedFragment.padaStart = "${req.body.padaStart}", selectedFragment.stanzaEnd = "${req.body.stanzaEnd}", selectedFragment.padaEnd = "${req.body.padaEnd}"
                MERGE (edition)-[:HAS_FRAGMENT]->(selectedFragment)
                MERGE (parallel:Parallel {idAnnotation: "${req.body.idAnnotation}", book: "${req.body.parallelBook}", bookChapter: "${req.body.parallelChapter}", bookStanza: "${req.body.parallelStanza}", note: "${req.body.parallelNote}"})
                ON CREATE
                    SET parallel.stanzaStart = "${req.body.stanzaStart}", parallel.padaStart = "${req.body.padaStart}", parallel.value = '${req.body.parallel}', parallel.book = "${req.body.parallelBook}", parallel.bookChapter = "${req.body.parallelChapter}", parallel.bookStanza = "${req.body.parallelStanza}", parallel.note = "${req.body.parallelNote}"
                ON MATCH
                    SET parallel.stanzaStart = "${req.body.stanzaStart}", parallel.padaStart = "${req.body.padaStart}", parallel.value = '${req.body.parallel}', parallel.book = "${req.body.parallelBook}", parallel.bookChapter = "${req.body.parallelChapter}", parallel.bookStanza = "${req.body.parallelStanza}", parallel.note = "${req.body.parallelNote}"
                MERGE (work:Work {title: "${req.body.parallelWork}"})
                MERGE (author:Author {name: "${req.body.parallelAuthor}"})
                MERGE (selectedFragment)-[:HAS_PARALLEL]->(parallel)
                MERGE (parallel)<-[:HAS_FRAGMENT]-(work)
                MERGE (work)-[:WRITTEN_BY]->(author)
                WITH parallel
                MATCH (parallel)<-[pw:HAS_FRAGMENT]-(work:Work)
                WHERE NOT "${req.body.parallelWork}" CONTAINS work.title
                DELETE pw
                WITH work
                MATCH (work)-[wa:WRITTEN_BY]->(author:Author)
                WHERE NOT "${req.body.parallelWork}" CONTAINS author.name
                DELETE wa
                RETURN *
                `
            )
            .subscribe({
                onCompleted: () => {
                    console.log("Parallel added to the graph");
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
        res.redirect(process.env.URL_PATH + `/edit/${idEdition}-${idEditor}`);
    };
});

module.exports = router;