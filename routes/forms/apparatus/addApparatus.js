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
        var path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;
        /* save data */
        const session = driver.session();
        try {
            await session.writeTransaction(tx => tx
                .run(
                    `
                    MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)-[:EDITED_BY]->(editor:Editor)
                    WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                    OPTIONAL MATCH (edition)-[:PUBLISHED_ON]->(date:Date)
                    MERGE (manuscriptLemma:ManuscriptLemma {code: $manuscriptLemma})
                    MERGE (manuscriptVariant:ManuscriptVariant {code: $manuscriptVariant})
                    MERGE (edition)-[:HAS_FRAGMENT]->(selectedFragment:SelectedFragment {value: $selectedFragment, stanza: $stanza, pada: $pada})-[:HAS_LEMMA]->(lemma:Lemma {value: $lemma})-[:HAS_VARIANT]->(variant:Variant {value: $variant})
                    MERGE (lemma)-[:ATTESTED_IN]->(manuscriptLemma)
                    MERGE (variant)-[:ATTESTED_IN]->(manuscriptVariant)
                    RETURN work.title, edition.title, author.name, editor.name, date.on, selectedFragment.stanza, selectedFragment.pada, lemma.value, manuscriptLemma.code, variant.value, manuscriptVariant.code
                    `,
                    {
                        selectedFragment: req.body.selectedFragment,
                        stanza: req.body.stanza,
                        pada: req.body.pada,
                        lemma: req.body.lemma,
                        manuscriptLemma: req.body.manuscriptLemma,
                        variant: req.body.variant,
                        manuscriptVariant: req.body.manuscriptVariant
                    }
                )
                .subscribe({
                    onNext: record => {
                        res.render("edit", {
                            id: req.params.id,
                            work: record.get("work.title"),
                            title: record.get("edition.title"),
                            author: record.get("author.name"),
                            editor: record.get("editor.name"),
                            date: record.get("date.on"),
                            file: idEdition + "-" + idEditor + ".html",
                            stanza: record.get("selectedFragment.stanza"),
                            pada: JSON.stringify(record.get("selectedFragment.pada")).replace(/[\[\]\{\}\,\"]+/g, ""),
                            lemma: record.get("lemma.value"),
                            manuscriptLemma: record.get("manuscriptLemma.code"),
                            variant: record.get("variant.value"),
                            manuscriptVariant: record.get("manuscriptVariant.code")
                        })
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