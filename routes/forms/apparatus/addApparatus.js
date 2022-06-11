const express = require("express");
const path = require("path");
const formidable = require("formidable");
const bodyParser = require("body-parser");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post("/addApparatus/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)-[e:EDITED_BY]->(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                CREATE (selectedString:SelectedString {value: $selectedString}), (lemma:Lemma {value: $lemma}), (variant:Variant {value: $variant}), (edition)-[f:HAS_FRAGMENT]->(selectedString), (selectedString)-[l:HAS_LEMMA]->(lemma), (lemma)-[v:HAS_VARIANT]->(variant) 
                RETURN selectedString, lemma, variant
                `, 
                {selectedString: req.body.selectedString, lemma: req.body.lemma, variant: req.body.variant}
            )
            .subscribe({
                onNext: record => {
                    res.redirect("/addMetadata/" + idEdition + "-" + idEditor);
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