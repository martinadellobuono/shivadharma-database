const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.post("/addWitnesses/:id", async (req, res) => {
    const idEdition = req.params.id.split("/").pop().split("-")[0];
    const idEditor = req.params.id.split("/").pop().split("-")[1];
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)-[:EDITED_BY]->(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                MERGE (witness:Witness {siglum: $siglum})
                MERGE (edition)<-[:USED_IN]-(witness)
                RETURN witness.siglum
                `, { siglum: req.body.witnessSiglum }
            )
            .subscribe({
                onNext: record => {
                    res.status(204).send();
                },
                onCompleted: () => {
                    console.log("Witnesses added to the graph");
                },
                onError: err => {
                    console.log("Error related to Neo4j action /addWitnesses/:id: " + err)
                }
            })
        );
    } catch (err) {
        console.log("Error related to Neo4j action /addWitnesses/:id: " + err);
    } finally {
        await session.close();
    };
});

module.exports = router;