const express = require("express");
const bodyParser = require("body-parser");

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
        const session = driver.session();
        try {
            await session.writeTransaction(tx => tx
                .run(
                    `
                    MATCH (edition:Edition)-[e:EDITED_BY]->(editor:Editor), (work:Work)-[r:HAS_MANIFESTATION]->(edition), (work)-[w:WRITTEN_BY]->(author:Author)
                    WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                    OPTIONAL MATCH (edition)-[p:PUBLISHED_ON]->(date:Date)
                    OPTIONAL MATCH (file:File)-[pr:PRODUCED_BY]->(editor)
                    MERGE (edition)-[f:HAS_FRAGMENT]->(selectedFragment:SelectedFragment {value: $selectedFragment})
                    MERGE (selectedFragment)-[l:HAS_LEMMA]->(lemma:Lemma {value: $lemma})
                    MERGE (lemma)-[v:HAS_VARIANT]->(variant:Variant {value: $variant})
                    MERGE (lemma)-[at:ATTESTED_IN]->(manuscriptLemma:ManuscriptLemma {code: $manuscriptLemma})
                    MERGE (variant)-[t:ATTESTED_IN]->(manuscriptVariant:ManuscriptVariant {code: $manuscriptVariant})
                    RETURN work.title, edition.title, author.name, editor.name, date.on, file.name, lemma.value, manuscriptLemma.code, variant.value, manuscriptVariant.code
                    `,
                    {
                        selectedFragment: req.body.selectedFragment,
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
                            file: record.get("file.name"),
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