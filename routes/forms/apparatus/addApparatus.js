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
                    } else {
                        if (padaStartArr.includes("a") && padaStartArr.includes("b") && padaStartArr.includes("c") && padaStartArr.includes("d") && padaStartArr.includes("e") && padaStartArr.includes("f")) {
                            padaStartArr = [];
                        };
                    };

                    var padaEndArr = req.body.padaEnd;
                    if (padaEndArr == undefined) {
                        padaEndArr = [];
                    } else {
                        if (padaEndArr.includes("a") && padaEndArr.includes("b") && padaEndArr.includes("c") && padaEndArr.includes("d") && padaEndArr.includes("e") && padaEndArr.includes("f")) {
                            padaEndArr = [];
                        };
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

                        MERGE (selectedFragment:SelectedFragment {value: "${req.body.selectedFragment}"})
                        ON CREATE
                            SET selectedFragment.chapter = "${req.body.chapter}", selectedFragment.stanzaStart = "${req.body.stanzaStart}", selectedFragment.padaStart = "${padaStartArr}", selectedFragment.stanzaEnd = "${req.body.stanzaEnd}", selectedFragment.padaEnd = "${padaEndArr}"
                        ON MATCH
                            SET selectedFragment.chapter = "${req.body.chapter}", selectedFragment.stanzaStart = "${req.body.stanzaStart}", selectedFragment.padaStart = "${padaStartArr}", selectedFragment.stanzaEnd = "${req.body.stanzaEnd}", selectedFragment.padaEnd = "${padaEndArr}"
                        
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

                        WITH lemma
                        OPTIONAL MATCH (lemma)-[wl:ATTESTED_IN]->(l:Witness)
                        WHERE lemma.idLemma = "${req.body.idLemma}" AND NOT "${req.body.manuscriptLemma}" CONTAINS l.siglum
                        DELETE wl

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
            await session.close();
            res.redirect(`../edit/${idEdition}-${idEditor}`);
        };
    });

module.exports = router;