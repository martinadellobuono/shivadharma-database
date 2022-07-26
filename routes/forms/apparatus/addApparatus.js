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

router.post("/addApparatus/:id",
    /* error handling */
    body("selectedFragment").isLength({ min: 1 }).withMessage("selected fragment"),
    body("lemma").isLength({ min: 1 }).withMessage("lemma"),
    body("variant").isLength({ min: 1 }).withMessage("variant"),
    async (req, res) => {
        const errors = validationResult(req);
        var idEdition = req.params.id.split("/").pop().split("-")[0];
        var idEditor = req.params.id.split("/").pop().split("-")[1];

        var i = 0;
        
        /* save data */
        const session = driver.session();
        try {
            await session.writeTransaction(tx => tx
                .run(
                    `
                        MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)-[:EDITED_BY]->(editor:Editor)
                        WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                        OPTIONAL MATCH (edition)-[:PUBLISHED_ON]->(date:Date)          
                        MERGE (selectedFragment:SelectedFragment {value: "${req.body.selectedFragment}", stanza: "${req.body.stanza}", pada: "${req.body.pada}"})
                        MERGE (edition)-[:HAS_FRAGMENT]->(selectedFragment)
                        MERGE (lemma:Lemma {value: "${req.body.lemma}"})
                        MERGE (selectedFragment)-[:HAS_LEMMA]->(lemma)
                        FOREACH (wit IN split("${req.body.manuscriptLemma}", " | ") |
                            MERGE (witLemma:Witness {siglum: wit})
                            MERGE (lemma)-[:ATTESTED_IN]->(witLemma)
                        )
    
                        
                        FOREACH (v IN split("${req.body.variant}", ",") |
                            MERGE (variant:Variant {value: v})
                            MERGE (lemma)-[:HAS_VARIANT]->(variant)
                            FOREACH (wit IN split("${req.body.manuscriptVariant}", " | ") |
                                MERGE (witVariant:Witness {siglum: wit})
                                MERGE (variant)-[:ATTESTED_IN]->(witVariant)
                                
                            )
                        )

                        
                        RETURN *
                        `
                )
                .subscribe({
                    onNext: () => {
                        res.redirect(`../edit/${idEdition}-${idEditor}`);
                    },

                    onCompleted: (record) => {
                        console.log("The apparatus entry is: " + record.get("editor.name"));
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
            console.log("Error related to Neo4j in adding the apparatus: " + err);
        } finally {
            await session.close();
        };
    });

module.exports = router;