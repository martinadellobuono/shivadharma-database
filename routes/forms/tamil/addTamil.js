const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
const { body, validationResult } = require("express-validator");
const { render } = require("ejs");

router.post(process.env.URL_PATH + "/addTamil/:id", async (req, res) => {
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
                MERGE (selectedFragment)-[:HAS_TAMIL_TRANSLATION]->(tamilTranslation:tamilTranslation {idAnnotation: "${req.body.idAnnotation}"})
                ON CREATE
                    SET tamilTranslation.value = '${req.body.tamilText}', tamilTranslation.note = '${req.body.tamilTextNote}', tamilTranslation.translation = '${req.body.tamilTranslation}', tamilTranslation.translationNote = '${req.body.tamilTranslationNote}', tamilTranslation.intro = "${req.body.tamilIntro}", tamilTranslation.commentary = "${req.body.tamilCommentary}", tamilTranslation.commentaryTranslation = "${req.body.tamilCommentaryTranslation}"
                ON MATCH
                    SET tamilTranslation.value = '${req.body.tamilText}', tamilTranslation.note = '${req.body.tamilTextNote}', tamilTranslation.translation = '${req.body.tamilTranslation}', tamilTranslation.translationNote = '${req.body.tamilTranslationNote}', tamilTranslation.intro = "${req.body.tamilIntro}", tamilTranslation.commentary = "${req.body.tamilCommentary}", tamilTranslation.commentaryTranslation = "${req.body.tamilCommentaryTranslation}"                
                RETURN *
                `
            )
            .subscribe({
                onCompleted: () => {
                    console.log("Tamil text added to the graph");
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