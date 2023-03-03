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

router.post("/addApparatus/:id", async (req, res) => {
        var idEdition = req.params.id.split("/").pop().split("-")[0];
        var idEditor = req.params.id.split("/").pop().split("-")[1];
        var i = 0;

        /* id variant */
        var idVariant = "idVariant" + i;

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

                    /* remove "all" from padas arrays */
                    var padaStartArr = req.body.padaStart;

                    if (padaStartArr == undefined) {
                        padaStartArr = [];
                    };

                    var padaEndArr = req.body.padaEnd;
                    if (padaEndArr == undefined) {
                        padaEndArr = [];
                    };

                    /* id variant */
                    idVariant = "idVariant" + i;

                    /* variant additions */
                    manuscriptVariant = "manuscriptVariant" + i;
                    notesVariant = "variant" + i + "Omission";
                    idWitnessVariant = "idWitnessVariant" + i;

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

                        MERGE (selectedFragment:SelectedFragment {idAnnotation: "${req.body.idAnnotation}"})
                        ON CREATE
                            SET selectedFragment.value = "${req.body.selectedFragment}", selectedFragment.chapter = "${req.body.chapter}", selectedFragment.stanzaStart = "${req.body.stanzaStart}", selectedFragment.padaStart = "${req.body.padaStart}", selectedFragment.stanzaEnd = "${req.body.stanzaEnd}", selectedFragment.padaEnd = "${req.body.padaEnd}"
                        ON MATCH
                            SET selectedFragment.value = "${req.body.selectedFragment}", selectedFragment.chapter = "${req.body.chapter}", selectedFragment.stanzaStart = "${req.body.stanzaStart}", selectedFragment.padaStart = "${req.body.padaStart}", selectedFragment.stanzaEnd = "${req.body.stanzaEnd}", selectedFragment.padaEnd = "${req.body.padaEnd}"
                        
                        MERGE (edition)-[:HAS_FRAGMENT]->(selectedFragment)

                        MERGE (lemma:Lemma {idLemma: "${req.body.idLemma}"})
                        ON CREATE
                            SET lemma.value = "${lemmaReq}", lemma.truncation = "${req.body.lemmaTruncation}", lemma.notes = "${req.body.lemmaNotes}"
                        ON MATCH
                            SET lemma.value = "${lemmaReq}", lemma.truncation = "${req.body.lemmaTruncation}", lemma.notes = "${req.body.lemmaNotes}"
                        
                        MERGE (selectedFragment)-[:HAS_LEMMA]->(lemma)

                        FOREACH (wit IN split("${req.body.manuscriptLemma}", " ; ") |
                            MERGE (witness:Witness {siglum: wit})
                            MERGE (lemma)-[:ATTESTED_IN]->(witness)
                        )

                        MERGE (variant:Variant {idVariant: "${req.body[idVariant]}"})
                        ON CREATE
                            SET variant.value = "${variantReq}", variant.number = "${i}", variant.notes = "${req.body[notesVariant]}"
                        ON MATCH
                            SET variant.value = "${variantReq}", variant.number = "${i}", variant.notes = "${req.body[notesVariant]}"
                        
                        MERGE (lemma)-[:HAS_VARIANT]->(variant)
                        
                        FOREACH (wit IN split("${req.body[manuscriptVariant]}", " ; ") |
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
                                console.log(err)
                            }
                        })
                    i++;
                });
            });
        } catch (err) {
            console.log(err);
        } finally {
            await session.close();
            res.redirect(`../edit/${idEdition}-${idEditor}`);
        };
    });

module.exports = router;