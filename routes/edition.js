const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const passport = require("passport");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.get("/edition/:id", async (req, res) => {
    const idEdition = req.params.id.split("/").pop().split("-")[0];
    const idEditor = req.params.id.split("/").pop().split("-")[1];
    var file = `${idEdition}-${idEditor}.html`;
    var path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;
    var work_temp = [];
    var title_temp = [];
    var auth_temp = [];
    var ed_temp = [];    
    var transl_temp = [];
    const session = driver.session();
    try {
        await session.readTransaction(tx => tx
            .run(
                `
                MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)-[:EDITED_BY]->(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                OPTIONAL MATCH (edition)-[:HAS_FRAGMENT]->(selectedFragment:SelectedFragment)-[:HAS_TRANSLATION]->(translation:Translation)
                RETURN work.title, edition.title, author.name, editor.name, translation.value
                `
            )
            .subscribe({
                onNext: record => {
                    if (!work_temp.includes(record.get("work.title"))) {
                        work_temp.push(record.get("work.title"));
                    };
                    if (!title_temp.includes(record.get("edition.title"))) {
                        title_temp.push(record.get("edition.title"));
                    };
                    if (!auth_temp.includes(record.get("author.name"))) {
                        auth_temp.push(record.get("author.name"));
                    };
                    if (!ed_temp.includes(record.get("editor.name"))) {
                        ed_temp.push(record.get("editor.name"));
                    };
                    if (!transl_temp.includes(record.get("translation.value"))) {
                        if (record.get("translation.value") !== null) {
                            transl_temp.push(record.get("translation.value"));
                        };
                    };
                    transl_temp = transl_temp.reverse();
                },
                onCompleted: () => {
                    if (fs.existsSync(path)) {
                        res.render("edition", {
                            id: req.params.id,
                            name: req.user.name,
                            work: work_temp,
                            title: title_temp,
                            author: auth_temp,
                            editor: ed_temp,
                            file: file,
                            translation: transl_temp
                        });
                    } else {
                        res.render("edition", {
                            id: req.params.id,
                            name: req.user.name,
                            work: work_temp,
                            title: title_temp,
                            author: auth_temp,
                            editor: ed_temp,
                            file: false,
                            translation: transl_temp
                        });
                    };
                },
                onError: err => {
                    console.log("Error related to the upload to Neo4j: " + err)
                }
            })
        );
    } catch (err) {
        console.log("Error related to Neo4j: " + err);
    } finally {
        await session.close();
    };
});

module.exports = router;