const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
const { body, validationResult } = require("express-validator");
const { render } = require("ejs");

router.post("/addApparatus/:id",
    async (req, res) => {
        var idEdition = req.params.id.split("/").pop().split("-")[0];
        var idEditor = req.params.id.split("/").pop().split("-")[1];
        var i = 0;

        /* manuscripts / notes to complete with i */
        var manuscriptVariant;
        var notesVariant;

        /* lemma / variant var to distinguish the omissions */
        var lemmaReq;
        var variantReq;

        /* array of the variants */
        let keys = Object.keys(req.body);
        var variants = [];
        keys.forEach((el) => {
            if (el.indexOf("variant") > -1) {
                if (!variants.includes(el)) {
                    if (!el.includes("presence") && !el.includes("Omission") && !el.includes("radios")) {
                        variants.push(el);
                    };
                };
            };
        });

        /* save data */
        const session = driver.session();
        try {
            await session.writeTransaction((tx) => {
                variants.forEach((variant) => {
                    manuscriptVariant = "manuscriptVariant" + i;
                    notesVariant = "variant" + i + "Omission";

                    /* lemma omission */
                    if (req.body.lemma == "") {
                        lemmaReq = "lemmaOmission___" + Math.random().toString(16).slice(2)
                    } else {
                        lemmaReq = req.body.lemma;
                    };

                    /* variant omission */
                    if (req.body[variant] == "") {
                        variantReq = "variantOmission___" + Math.random().toString(16).slice(2)
                    } else {
                        variantReq = req.body[variant];
                    };

                    tx.run(
                        `
                            MATCH (edition:Edition)-[:EDITED_BY]->(editor:Editor)
                            WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                            MERGE (selectedFragment:SelectedFragment {value: "${req.body.selectedFragment}", stanzaStart: "${req.body.stanzaStart}", padaStart: "${req.body.padaStart}", stanzaEnd: "${req.body.stanzaEnd}", padaEnd: "${req.body.padaEnd}"})
                            MERGE (edition)-[:HAS_FRAGMENT]->(selectedFragment)
                            CREATE (lemma:Lemma {value: "${lemmaReq}", notes: "${req.body.lemmaOmission}"})
                            CREATE (selectedFragment)-[:HAS_LEMMA]->(lemma)
                            FOREACH (wit IN split("${req.body.manuscriptLemma}", " | ") |
                                MERGE (witness:Witness {siglum: wit})
                                MERGE (lemma)-[:ATTESTED_IN]->(witness)
                            )
                            MERGE (variant:Variant {value: "${variantReq}", notes: "${req.body[notesVariant]}"})
                            MERGE (lemma)-[:HAS_VARIANT]->(variant)
                            FOREACH (wit IN split("${req.body[manuscriptVariant]}", " | ") |
                                    MERGE (witness:Witness {siglum: wit})
                                    MERGE (variant)-[:ATTESTED_IN]->(witness)
                            )
                            RETURN *
                            `
                    )
                        .subscribe({
                            onCompleted: () => {
                                console.log("Data added to the graph");
                            },
                            onError: err => {
                                console.log("Error related to the upload to Neo4j: " + err)
                            }
                        })
                    i++;
                });
            });
        } catch (err) {
            console.log("Error related to Neo4j in adding the apparatus: " + err);
        } finally {
            res.redirect(`../edit/${idEdition}-${idEditor}`);
            await session.close();
        };
    });

module.exports = router;