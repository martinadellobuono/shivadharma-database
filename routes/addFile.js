const express = require("express");
const path = require("path");
const formidable = require("formidable");
const bodyParser = require("body-parser");
const mammoth = require("mammoth");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post("/addFile/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];

    /* upload file */
    var form = formidable();
    form.parse(req);
    form.on("fileBegin", (name, file) => {
        file.path = `${__dirname}/../uploads/${file.name}`;
    });
    form.on("file", async (name, file) => {
        var url = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;
        if (file.type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            mammoth.convertToHtml({ path: file.path })
                .then((result) => {
                    try {
                        fs.access(file.path, fs.F_OK, () => {
                            fs.writeFile(file.path, result.value, "utf8", (err) => {
                                if (err) {
                                    console.log("Error related to rewriting the file: " + err);
                                } else {
                                    console.log("The file has been overwritten");
                                };
                            });
                            fs.rename(file.path, url, (err) => {
                                if (err) {
                                    console.log("Error related to renaming the file: " + err);
                                } else {
                                    console.log("The file has been renamed: " + `${idEdition}-${idEditor}.html`);
                                };
                            });
                        });
                    } catch (error) {
                        console.log("Error in converting the file: " + error);
                    };
                })
                .done(async () => {
                    /* put in the database and visualize it in the editor */
                    var fileName = `${idEdition}-${idEditor}.html`
                    const session = driver.session();
                    try {
                        try {
                            await session.writeTransaction(tx => tx
                                .run(
                                    `
                                        MATCH (author:Author)<-[w:WRITTEN_BY]-(work:Work)-[r:HAS_MANIFESTATION]->(edition:Edition)-[e:EDITED_BY]->(editor:Editor)
                                        WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                                        OPTIONAL MATCH (edition)-[p:PUBLISHED_ON]->(date:Date)
                                        OPTIONAL MATCH (witness:Witness)-[:USED_IN]->(edition)
                                        MERGE (file:File {name: $file})
                                        MERGE (file)-[pr:PRODUCED_BY]->(editor)
                                        RETURN work.title, edition.title, author.name, editor.name, date.on, witness.siglum, file.name
                                        `, { file: fileName }
                                )
                                .subscribe({
                                    onCompleted: () => {
                                        console.log("Data added to the database");
                                    },
                                    onError: err => {
                                        console.log("Error related to Neo4j action /addFile/:id: " + err);
                                    }
                                })
                            );
                        } catch (err) {
                            console.log("Error related to Neo4j: " + err);
                        } finally {
                            await session.close();
                        };
                    } catch (err) {
                        console.log(err);
                    } finally {
                        res.redirect("/edit/" + idEdition + "-" + idEditor);
                    };
                });
        } else {
            fs.rename(file.path, url, (err) => {
                if (err) {
                    console.log("Error related to renaming the file: " + err);
                } else {
                    console.log("The file has been renamed: " + file.name);
                };
            });
        };
    });
    form.on("error", (err) => {
        console.log(err);
    })
    form.on("end", async () => {
        console.log("File uploaded");
    });

});

module.exports = router;