const express = require("express");
const bodyParser = require("body-parser");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

const { body, validationResult } = require("express-validator");

router.post("/addApparatus/:id",
    /* error handling */
    body("selectedString").isLength({ min: 1 }).withMessage("selected string"),
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
                    MATCH (edition:Edition)-[e:EDITED_BY]->(editor:Editor), (edition)-[p:PUBLISHED_ON]->(date:Date), (file:File)-[pr:PRODUCED_BY]->(editor), (work:Work)-[r:HAS_MANIFESTATION]->(edition), (work)-[w:WRITTEN_BY]->(author:Author)
                    WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                    MERGE (edition)-[f:HAS_FRAGMENT]->(selectedString:SelectedString {value: $selectedString})
                    MERGE (selectedString)-[l:HAS_LEMMA]->(lemma:Lemma {value: $lemma})
                    CREATE (lemma)-[v:HAS_VARIANT]->(variant:Variant {value: $variant})
                    RETURN work.title, edition.title, author.name, editor.name, date.on, file.name, lemma.value, variant.value
                    `, 
                    {
                        selectedString: req.body.selectedString,
                        lemma: req.body.lemma,
                        variant: req.body.variant
                    }
                )
                .subscribe({
                    onNext: record => {
                        res.render("addAnnotations", {
                            id: req.params.id,
                            errors: errors.array(),
                            work: record.get("work.title"),
                            title: record.get("edition.title"),
                            author: record.get("author.name"),
                            editor: record.get("editor.name"),
                            date: record.get("date.on"),
                            file: record.get("file.name"),
                            lemma: record.get("lemma.value"),
                            variant: record.get("variant.value")
                        });
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