const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.post(process.env.URL_PATH + "/deleteTranslation", async (req, res) => {
    /* edition / editor id */
    var idEdition = req.body.idEdition;
    var idEditor = req.body.idEditor;

    /* translation to delete */
    var idAnnotation = req.body.idAnnotation;

    /* delete the translation */
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH ()-[r]->(n)
                WHERE n.idAnnotation = "${idAnnotation}"
                DELETE r, n
                `
            )
            .subscribe({
                onCompleted: () => {
                    console.log("Annotated fragment deleted.");
                },
                onError: err => {
                    console.log(err)
                }
            })
        );
    } catch {
        console.log(err);
    } finally {
        /* close session */
        await session.close();
    };  

    /* send res */
    res.json(idAnnotation);
});

module.exports = router;