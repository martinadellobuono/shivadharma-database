/*
    File addApparatus.js
    Author: Martina Dello Buono
    Author's address: martinadellobuono1@gmail.com
    Copyright (c) 2023 by the author
    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.
    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
    SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
    OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
    CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const { body, validationResult } = require("express-validator");
const { render } = require("ejs");

router.post(process.env.URL_PATH + "/addApparatus/:id", async (req, res) => {
    
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

                /* array of lemma witnesses > remove empty siglum */
                var lemmaWits = [];
                req.body.manuscriptLemma.split(" ; ").forEach((wit) => {
                    if (!lemmaWits.includes(wit)) {
                        if (wit !== "") {
                            lemmaWits.push(wit);
                        };
                    };
                });

                tx.run(
                    `
                        MATCH (edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
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

                        FOREACH (wit IN split("${lemmaWits}", ",") |
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
                            console.log("Apparatus entry added to the graph");
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
        res.redirect(process.env.URL_PATH + `/edit/${idEdition}-${idEditor}`);
    };
});

module.exports = router;