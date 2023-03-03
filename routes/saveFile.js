const express = require("express");
const path = require("path");
const formidable = require("formidable");
const bodyParser = require("body-parser");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.post("/saveFile", async (req, res) => {
    var idEdition = req.body.idEdition;
    var idEditor = req.body.idEditor;
    var contentFile = req.body.contentFile;
    var path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;
    if (contentFile !== undefined) { /* it avoids errors when uploading a new file */
        try {
            /* SAVE THE FILE */
            fs.access(path, fs.F_OK, () => {
                fs.writeFile(path, contentFile, "utf8", (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("The file has been overwritten");
                    };
                });
            });
        } catch (error) {
            console.log(error);
        } finally {
            /* SEND THE NEW FRAGMENT TO THE DATABASE IF EXISTS */
            const session = driver.session();
            try {
                var idFragment = req.body.idFragment;
                var contentFragment = req.body.contentFragment;

                if (idFragment !== undefined) {
                    await session.writeTransaction(tx => tx
                        .run(
                            `
                            MATCH (edition:Edition)-[:EDITED_BY]->(editor:Editor)
                            WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                            MERGE (selectedFragment:SelectedFragment {idAnnotation: "${idFragment}"})
                            ON CREATE
                                SET selectedFragment.value = "${contentFragment}"
                            ON MATCH
                                SET selectedFragment.value = "${contentFragment}"
                            RETURN *
                            `
                        )
                        .subscribe({
                            onCompleted: () => {
                                console.log("Annotated fragment updated.");
                            },
                            onError: err => {
                                console.log("Error related to the upload to Neo4j: " + err)
                            }
                        })
                    );
                };

            } catch (err) {
                console.log(err);
            } finally {
                await session.close();
            };
        };
    };
});

module.exports = router;