const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.post("/publish/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    var publishType = req.body.publishType;
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)-[:EDITED_BY]->(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                SET edition.publishType = "${publishType}"
                RETURN *
                `
            )
            .subscribe({
                onCompleted: () => {
                    console.log("Published as " + publishType);
                },
                onError: err => {
                    console.log(err)
                }
            })
        );
    } catch (err) {
        console.log(err);
    } finally {
        /* close session */
        await session.close();
    };

});

module.exports = router;