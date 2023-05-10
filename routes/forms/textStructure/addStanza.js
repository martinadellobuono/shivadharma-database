const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
const { body, validationResult } = require("express-validator");
const { render } = require("ejs");

/* add stanza */
router.post(process.env.URL_PATH + "/addStanza/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (chapter:Chapter)<-[:HAS_CHAPTER]-(edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                WHERE ID(edition) = ${idEdition} AND ID(editor) = ${idEditor} AND chapter.n = "${req.body.stanzaRefChapter}"
                MERGE (stanza:Stanza {idAnnotation: "${req.body.idAnnotation}"})
                ON CREATE
                    SET stanza.n = "${req.body.stanzaN}", stanza.name = "${req.body.stanzaName}", stanza.refChapter = "${req.body.stanzaRefChapter}"
                ON MATCH
                    SET stanza.n = "${req.body.stanzaN}", stanza.name = "${req.body.stanzaName}", stanza.refChapter = "${req.body.stanzaRefChapter}"
                MERGE (chapter)-[:HAS_STANZA]->(stanza)
                
                RETURN *
                `
            )
            .subscribe({
                onCompleted: () => {
                    console.log("Stanza added to the graph");
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