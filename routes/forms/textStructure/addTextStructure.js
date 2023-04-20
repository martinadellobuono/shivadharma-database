const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
const { body, validationResult } = require("express-validator");
const { render } = require("ejs");

router.post(process.env.URL_PATH + "/addTextStructure/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    var structure = req.body.textStructure.toUpperCase();
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                WHERE ID(edition) = ${idEdition} AND ID(editor) = ${idEditor}
                MERGE (textStructure:TextStructure {idAnnotation: "${req.body.idAnnotation}"})
                ON CREATE
                    SET textStructure.structure = "${req.body.textStructure}"
                ON MATCH
                    SET textStructure.structure = "${req.body.textStructure}"
                
                WITH edition
                MATCH (txt:TextStructure)
                WHERE txt.structure = "chapter" AND txt.idAnnotation = "${req.body.idAnnotation}"
                MERGE (edition)-[:HAS_${structure}]->(txt)
                ON CREATE
                    SET txt.chapter = "${req.body.textStructureChapter}"
                ON MATCH
                    SET txt.chapter = "${req.body.textStructureChapter}"

                RETURN *
                `
            )
            .subscribe({
                onCompleted: () => {
                    console.log("Text structure added to the graph");
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