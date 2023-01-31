const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const passport = require("passport");

const neo4j = require("neo4j-driver");
const { Console } = require("console");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.get("/edit/:id", async (req, res) => {
    const idEdition = req.params.id.split("/").pop().split("-")[0];
    const idEditor = req.params.id.split("/").pop().split("-")[1];

    var file = `${idEdition}-${idEditor}.html`;
    var path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;
    var work;
    var title;
    var chapter;
    var translation = [];
    var commentary = [];
    var parallels = [];
    var citations = [];
    var notes = [];

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
                OPTIONAL MATCH (parallel)<-[:HAS_FRAGMENT]-(parallelWork:Work)-[:WRITTEN_BY]->(parallelAuthor:Author)
                OPTIONAL MATCH (selectedFragment)-[:IS_A_CITATION_OF]->(citation:Citation)
                OPTIONAL MATCH (selectedFragment)-[:IS_DESCRIBED_IN]->(note:Note)
                RETURN work.title, edition.title, author.name, editor.name, selectedFragment.chapter, selectedFragment.stanzaStart, selectedFragment.stanzaEnd, selectedFragment.padaStart, selectedFragment.padaEnd, selectedFragment.value, ID(translation), translation.idAnnotation, translation.value, translation.note, ID(commentary), commentary.idAnnotation, commentary.value, commentary.note, commentary.translation, commentary.translationNote, ID(parallel), parallel.idAnnotation, parallel.book, parallel.bookChapter, parallel.bookStanza, parallel.note, parallel.value, parallelWork.title, parallelAuthor.name, ID(citation), citation.idAnnotation, citation.value, ID(note), note.idAnnotation, note.value
                `
            )
            .subscribe({
                onNext: record => {
                    /* chapter */
                    chapter = record.get("selectedFragment.chapter")

                    /* translations */
                    if (record.get("translation.value") !== null) {
                        translation.push({
                            id: record.get("ID(translation)"),
                            idAnnotation: record.get("translation.idAnnotation"),
                            chapter: chapter,
                            stanzaStart: record.get("selectedFragment.stanzaStart"),
                            stanzaEnd: record.get("selectedFragment.stanzaEnd"),
                            padaStart: record.get("selectedFragment.padaStart"),
                            padaEnd: record.get("selectedFragment.padaEnd"),
                            fragment: record.get("selectedFragment.value"),
                            value: record.get("translation.value"),
                            note: record.get("translation.note")
                        });
                    };

                    /* commentary */
                    if (record.get("commentary.value") !== null) {
                        commentary.push({
                            id: record.get("ID(commentary)"),
                            idAnnotation: record.get("commentary.idAnnotation"),
                            chapter: chapter,
                            stanzaStart: record.get("selectedFragment.stanzaStart"),
                            stanzaEnd: record.get("selectedFragment.stanzaEnd"),
                            padaStart: record.get("selectedFragment.padaStart"),
                            padaEnd: record.get("selectedFragment.padaEnd"),
                            fragment: record.get("selectedFragment.value"),
                            value: record.get("commentary.value"),
                            note: record.get("commentary.note"),
                            translation: record.get("commentary.translation"),
                            translationNote: record.get("commentary.translationNote")
                        });
                    };

                    /* parallels */
                    if (record.get("parallel.value") !== null) {
                        var work = record.get("parallelWork.title") + "___" + record.get("parallelAuthor.name");

                        var dictionary = {
                            [work]: {
                                id: record.get("ID(parallel)"),
                                idAnnotation: record.get("parallel.idAnnotation"),
                                chapter: chapter,
                                stanzaStart: record.get("selectedFragment.stanzaStart"),
                                stanzaEnd: record.get("selectedFragment.stanzaEnd"),
                                padaStart: record.get("selectedFragment.padaStart"),
                                padaEnd: record.get("selectedFragment.padaEnd"),
                                fragment: record.get("selectedFragment.value"),
                                work: record.get("parallelWork.title"),
                                author: record.get("parallelAuthor.name"),
                                book: record.get("parallel.book"),
                                bookChapter: record.get("parallel.bookChapter"),
                                bookStanza: record.get("parallel.bookStanza"),
                                value: record.get("parallel.value"),
                                note: record.get("parallel.note")
                            }
                        };

                        parallels.push(dictionary);
                    };

                    /* citations */
                    if (record.get("citation.value") !== null) {
                        citations.push({
                            id: record.get("ID(citation)"),
                            idAnnotation: record.get("citation.idAnnotation"),
                            chapter: chapter,
                            stanzaStart: record.get("selectedFragment.stanzaStart"),
                            stanzaEnd: record.get("selectedFragment.stanzaEnd"),
                            padaStart: record.get("selectedFragment.padaStart"),
                            padaEnd: record.get("selectedFragment.padaEnd"),
                            fragment: record.get("selectedFragment.value"),
                            value: record.get("citation.value")
                        });
                    };

                    /* notes */
                    if (record.get("note.value") !== null) {
                        notes.push({
                            id: record.get("ID(note)"),
                            idAnnotation: record.get("note.idAnnotation"),
                            chapter: chapter,
                            stanzaStart: record.get("selectedFragment.stanzaStart"),
                            stanzaEnd: record.get("selectedFragment.stanzaEnd"),
                            padaStart: record.get("selectedFragment.padaStart"),
                            padaEnd: record.get("selectedFragment.padaEnd"),
                            fragment: record.get("selectedFragment.value"),
                            value: record.get("note.value")
                        });
                    };
                },
                onCompleted: () => {

                    /* ordered translations */
                    translation.sort((a, b) => {
                        return a.chapter - b.chapter;
                    });
                    translation.sort((a, b) => {
                        return a.stanzaStart - b.stanzaStart;
                    });
                    translation.sort((a, b) => {
                        return a.padaStart - b.padaStart;
                    });

                    /* ordered commentary */
                    commentary.sort((a, b) => {
                        return a.chapter - b.chapter;
                    });
                    commentary.sort((a, b) => {
                        return a.stanzaStart - b.stanzaStart;
                    });
                    commentary.sort((a, b) => {
                        return a.padaStart - b.padaStart;
                    });

                    /* ordered parallels */
                    /* create an array of the parallels title */
                    var parallels_keys = [];
                    parallels.forEach((parallel) => {
                        for (const [key, value] of Object.entries(parallel)) {
                            if (!parallels_keys.includes(key)) {
                                parallels_keys.push(key);
                            };
                        }
                    });

                    /* create a dictionary for each parallel work / an array containing all the dictionaries */
                    var all_parallels = [];
                    parallels_keys.forEach((title) => {

                        /* create a dictionary of parallels for each title */
                        var work = {
                            [title]: {}
                        };

                        /* create an array of parallels values for each title */
                        var values = [];

                        /* assign the value to the dictionary */
                        parallels.forEach((parallel) => {
                            for (const [key, value] of Object.entries(parallel)) {
                                if (key == title) {
                                    /* value of the dictionary = full-text of parallels */
                                    if (!values.includes(value)) {
                                        values.push(value);
                                    };
                                    values.sort((a, b) => {
                                        return a.book - b.book;
                                    });
                                    values.sort((a, b) => {
                                        return a.bookChapter - b.bookChapter;
                                    });
                                    values.sort((a, b) => {
                                        return a.bookStanza - b.bookStanza;
                                    });

                                    /* key = title / value = full-text of parallels */
                                    work[title] = values;
                                };
                            };
                        });

                        /* add the dictionary to the array containing all the parallels divided by title */
                        all_parallels.push(work);

                    });

                    /* ordered citations */
                    citations.sort((a, b) => {
                        return a.stanzaStart - b.stanzaStart;
                    });
                    citations.sort((a, b) => {
                        return a.padaStart - b.padaStart;
                    });

                    /* ordered notes */
                    notes.sort((a, b) => {
                        return a.stanzaStart - b.stanzaStart;
                    });
                    notes.sort((a, b) => {
                        return a.padaStart - b.padaStart;
                    });

                    /* page rendering */
                    if (fs.existsSync(path)) {
                        res.render("edit", {
                            id: req.params.id,
                            name: req.user.name,
                            work: work,
                            title: title,
                            file: file,
                            chapter: chapter,
                            translation: translation,
                            commentary: commentary,
                            parallels: all_parallels,
                            citations: citations,
                            notes: notes,

                            editionOf: "", // cambia
                            authorCommentary: "", // cambia
                            author: "", // cambia
                            editor: "", // cambia
                            date: "", // cambia
                            sigla: "", // cambia
                            appEntryDict: "", // cambia
                            translations: "", // cambia
                            commentaries: "" // cambia
                        });
                    } else {
                        res.render("edit", {
                            id: req.params.id,
                            name: req.user.name,
                            work: work,
                            title: title,
                            editionOf: "", // cambia
                            authorCommentary: "", // cambia
                            author: "", // cambia
                            editor: "", // cambia
                            date: "", // cambia
                            sigla: "", // cambia
                            file: false,
                            chapter: chapter,
                            translation: translation,
                            appEntryDict: "", // cambia
                            translations: "", // cambia
                            commentaries: "", // cambia
                            citations: "", // cmabia
                            notes: "" // cambia
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

router.post("/edit/:id", async (req, res) => {
    const idEdition = req.params.id.split("/").pop().split("-")[0];
    const idEditor = req.params.id.split("/").pop().split("-")[1];
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)-[e:EDITED_BY]->(editor:Editor), (work:Work)-[h:HAS_MANIFESTATION]->(edition), (work)-[w:WRITTEN_BY]->(author:Author)  
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                OPTIONAL MATCH (file:File)-[pr:PRODUCED_BY]->(editor)
                OPTIONAL MATCH (witness:Witness)-[:USED_IN]->(edition)
                MERGE (date:Date)
                MERGE (edition)-[p:PUBLISHED_ON]->(date)
                ON CREATE
                    SET edition.title = "${req.body.title}", edition.editionOf = "${req.body.editionOf}", edition.authorCommentary = "${req.body.authorCommentary}", date.on = "${req.body.date}", editor.name = "${req.body.editor}", work.title = "${req.body.work}", author.name = "${req.body.author}"
                ON MATCH 
                    SET edition.title = "${req.body.title}", edition.editionOf = "${req.body.editionOf}", edition.authorCommentary = "${req.body.authorCommentary}", date.on = "${req.body.date}", editor.name = "${req.body.editor}", work.title = "${req.body.work}", author.name = "${req.body.author}"
                RETURN *
                `
            )
            .subscribe({
                onNext: () => {
                    res.redirect("../edit/" + idEdition + "-" + idEditor);
                },
                onCompleted: () => {
                    console.log("Data added to the database")
                },
                onError: err => {
                    console.log("Error related to Neo4j action /edit/:id: " + err)
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