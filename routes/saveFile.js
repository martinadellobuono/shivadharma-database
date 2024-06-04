const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const asyncLock = require("async-lock");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();

router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

const lock = new asyncLock();

router.post(process.env.URL_PATH + "/saveFile", async (req, res) => {
    const { idEdition, idEditor, contentFile, idFragment, contentFragment } = req.body;
    const path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;

    if (contentFile !== undefined) {
        lock.acquire(path, async (done) => {
            try {
                await fs.promises.writeFile(path, contentFile, "utf8");
                console.log("The file has been overwritten");

                if (idFragment !== undefined) {
                    const session = driver.session();
                    try {
                        await session.writeTransaction(tx => tx.run(`
                            MATCH (edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                            WHERE id(edition) = $idEdition AND id(editor) = $idEditor
                            MERGE (selectedFragment:SelectedFragment {idAnnotation: $idFragment})
                            ON CREATE SET selectedFragment.value = $contentFragment
                            ON MATCH SET selectedFragment.value = $contentFragment
                            RETURN *
                        `, { idEdition: parseInt(idEdition), idEditor: parseInt(idEditor), idFragment, contentFragment }));

                        console.log("Annotated fragment updated.");
                    } finally {
                        await session.close();
                    };
                };
                res.json(contentFile);
            } catch (err) {
                console.error(err);
                res.status(500).send("An error occurred while saving the file");
            } finally {
                done();
            };
        });
    } else {
        res.status(400).send("Content file is undefined");
    }
});

module.exports = router;