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
    var chapter;
    var transl_temp = [];
    var comm_temp = [];
    var paral_temp = [];
    var cit_temp = [];
    var notes_temp = [];

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
                OPTIONAL MATCH (selectedFragment)-[:IS_A_CITATION_OF]->(citation:Citation)
                OPTIONAL MATCH (selectedFragment)-[:IS_DESCRIBED_IN]->(note:Note)
                RETURN work.title, edition.title, author.name, editor.name, ID(translation), selectedFragment.chapter, selectedFragment.stanzaStart, selectedFragment.padaStart, translation.value, translation.note, ID(commentary), commentary.value, commentary.note, commentary.translation, commentary.translationNote, parallel.value, citation.value, note.value
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
                    /* chapter */
                    chapter = record.get("selectedFragment.chapter");
                    /* translations temp */
                    if (!transl_temp.includes(record.get("translation.value"))) {
                        if (record.get("translation.value") !== null) {
                            transl_temp.push(record.get("selectedFragment.stanzaStart") + "___" + record.get("translation.value") + "@" + record.get("translation.note") + "#" + record.get("ID(translation)"));
                        };
                    };
                    /* commentary temp */
                    if (!comm_temp.includes(record.get("commentary.value"))) {
                        if (record.get("commentary.value") !== null) {
                            comm_temp.push(record.get("selectedFragment.stanzaStart") + "___" + record.get("commentary.value") + "@" + record.get("commentary.note") + "$" + record.get("commentary.translation") + "===" + record.get("commentary.translationNote") + "#" + record.get("ID(commentary)"));
                        };
                    };
                    /* parallels temp */
                    if (!paral_temp.includes(record.get("parallel.value"))) {
                        if (record.get("parallel.value") !== null) {
                            paral_temp.push(record.get("selectedFragment.stanzaStart") + "___" + record.get("parallel.value"));
                        };
                    };
                    /* citations temp */
                    if (!cit_temp.includes(record.get("citation.value"))) {
                        if (record.get("citation.value") !== null) {
                            cit_temp.push(record.get("selectedFragment.stanzaStart") + "___" + record.get("citation.value"));
                        };
                    };
                    /* notes temp */
                    if (!notes_temp.includes(record.get("note.value"))) {
                        if (record.get("note.value") !== null) {
                            notes_temp.push(record.get("selectedFragment.stanzaStart") + "___" + record.get("note.value") + "///" + record.get("selectedFragment.padaStart"));
                        };
                    };
                },
                onCompleted: () => {

                    /* ordered translations */
                    var translations = [];
                    transl_temp = transl_temp.sort((a, b) => a.split("___")[0] - b.split("___")[0]);
                    transl_temp.forEach((el) => {
                        if (!translations.includes(el)) {
                            translations.push(el);
                        };
                    });

                    /* ordered commentary */
                    var commentary = [];
                    comm_temp = comm_temp.sort((a, b) => a.split("___")[0] - b.split("___")[0]);
                    comm_temp.forEach((el) => {
                        if (!commentary.includes(el)) {
                            commentary.push(el.split("___")[1]);
                        };
                    });

                    /* ordered parallels */
                    var parallels = [];
                    paral_temp = paral_temp.sort((a, b) => a.split("___")[0] - b.split("___")[0]);
                    paral_temp.forEach((el) => {
                        if (!parallels.includes(el.split("___")[1])) {
                            parallels.push(el.split("___")[1]);
                        };
                    });

                    /* ordered citations */
                    var citations = [];
                    cit_temp = cit_temp.sort((a, b) => a.split("___")[0] - b.split("___")[0]);
                    cit_temp.forEach((el) => {
                        if (!citations.includes(el.split("___")[1])) {
                            citations.push(el.split("___")[1]);
                        };
                    });

                    /* ordered notes */
                    var notes = [];
                    notes_temp = notes_temp.sort((a, b) => a.split("___")[0] - b.split("___")[0]);
                    notes_temp = notes_temp.sort((a, b) => a.split("///")[0] - b.split("///")[0]);
                    notes_temp.forEach((el) => {
                        if (!notes.includes(el)) {
                            notes.push(el);
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
                            chapter: chapter,
                            translation: translations,
                            commentary: commentary,
                            parallels: parallels,
                            citations: citations,
                            notes: notes
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
                            parallels: parallels,
                            citations: citations,
                            notes: notes
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