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
    var comm_temp = [];
    var paral_temp = [];

    const session = driver.session();
    try {
        await session.readTransaction(tx => tx
            .run(
                `
                MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)-[:EDITED_BY]->(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                OPTIONAL MATCH (edition)-[:HAS_FRAGMENT]->(selectedFragment:SelectedFragment)
                OPTIONAL MATCH (selectedFragment)-[:HAS_TRANSLATION]->(translation:Translation)
                OPTIONAL MATCH (selectedFragment)-[:IS_COMMENTED_IN]->(commentary:Commentary)
                OPTIONAL MATCH (selectedFragment)-[:HAS_PARALLEL]->(parallel:Parallel)
                RETURN work.title, edition.title, author.name, editor.name, translation.location, translation.value, commentary.location, commentary.value, parallel.location, parallel.value
                `
            )
            .subscribe({
                onNext: record => {
                    /* work */
                    if (!work_temp.includes(record.get("work.title"))) {
                        work_temp.push(record.get("work.title"));
                    };
                    /* title */
                    if (!title_temp.includes(record.get("edition.title"))) {
                        title_temp.push(record.get("edition.title"));
                    };
                    /* author */
                    if (!auth_temp.includes(record.get("author.name"))) {
                        auth_temp.push(record.get("author.name"));
                    };
                    /* editor */
                    if (!ed_temp.includes(record.get("editor.name"))) {
                        ed_temp.push(record.get("editor.name"));
                    };
                    /* translations temp */
                    if (!transl_temp.includes(record.get("translation.value"))) {
                        if (record.get("translation.value") !== null) {
                            transl_temp.push(record.get("translation.location") + "___" + record.get("translation.value"));
                        };
                    };
                    /* commentary temp */
                    if (!comm_temp.includes(record.get("commentary.value"))) {
                        if (record.get("commentary.value") !== null) {
                            comm_temp.push(record.get("commentary.location") + "___" + record.get("commentary.value"));
                        };
                    };
                    /* parallels temp */
                    if (!paral_temp.includes(record.get("parallel.value"))) {
                        if (record.get("parallel.value") !== null) {
                            paral_temp.push(record.get("parallel.location") + "___" + record.get("parallel.value"));
                        };
                    };
                },
                onCompleted: () => {

                    console.log(comm_temp);

                    /* ordered translations */
                    var translations = [];
                    transl_temp = transl_temp.sort();
                    transl_temp.forEach((el) => {
                        if (!translations.includes(el.split("___")[1])) {
                            translations.push(el.split("___")[1]);
                        };
                    });

                    /* ordered commentary */
                    var commentary = [];
                    comm_temp = comm_temp.sort();
                    comm_temp.forEach((el) => {
                        if (!commentary.includes(el.split("___")[1])) {
                            commentary.push(el.split("___")[1]);
                        };
                    });

                    /* ordered parallels */
                    var parallels = [];
                    paral_temp = paral_temp.sort();
                    paral_temp.forEach((el) => {
                        if (!parallels.includes(el.split("___")[1])) {
                            parallels.push(el.split("___")[1]);
                        };
                    });

                    if (fs.existsSync(path)) {
                        res.render("edition", {
                            id: req.params.id,
                            name: req.user.name,
                            work: work_temp,
                            title: title_temp,
                            author: auth_temp,
                            editor: ed_temp,
                            file: file,
                            translation: translations,
                            commentary: commentary,
                            parallels: parallels
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
                            translation: translations,
                            commentary: comm_temp,
                            parallels: parallels
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