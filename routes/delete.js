const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.post(process.env.URL_PATH + "/delete/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    var nodeToDeleteID = req.body.nodeID;
    
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                WITH edition
                MATCH (n {idAnnotation: "${nodeToDeleteID}"})-[r]-()
                WHERE NOT (n)-[:HAS_TYPE]->(:Witness)
                DELETE n, r;
                `
            )
            .then(() => {
                console.log("Node deleted from the graph.");
            })
            .catch(err => {
                console.error(err);
            })
        );
    } catch (err) {
        console.error(err);
    } finally {
        await session.close();
    };

    /* send res */
    res.json({ "url": process.env.URL_PATH + "/edit/" + idEdition + "-" + idEditor });
});

module.exports = router;