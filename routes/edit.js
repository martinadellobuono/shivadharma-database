const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.get("/edit/:id", async (req, res) => {
    const idEdition = req.params.id.split("/").pop().split("-")[0];
    const idEditor = req.params.id.split("/").pop().split("-")[1];

    var file = `${idEdition}-${idEditor}.html`;
    var path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;
    var work_temp = [];
    var title_temp = [];
    var auth_temp = [];
    var ed_temp = [];
    var date_temp = [];
    var wit_temp = [];
    var transl_temp = [];
    var app_entry = [];

    const session = driver.session();
    try {
        await session.readTransaction(tx => tx
            .run(
                `
                MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)-[:EDITED_BY]->(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                OPTIONAL MATCH (edition)-[:PUBLISHED_ON]->(date:Date)
            
                OPTIONAL MATCH app_entry = (selectedFragment:SelectedFragment)-[:HAS_LEMMA]->(lemma:Lemma)-[:HAS_VARIANT]->(variant:Variant)-[:ATTESTED_IN]->(witness:Witness)

                OPTIONAL MATCH (witness)-[:USED_IN]->(edition)

                OPTIONAL MATCH (edition)-[:HAS_FRAGMENT]->(selectedFragment:SelectedFragment)-[:HAS_TRANSLATION]->(translation:Translation)
                RETURN work.title, edition.title, author.name, editor.name, witness.siglum, date.on, translation.value, app_entry
                `
            )
            .subscribe({
                onNext: record => {
                    if (!wit_temp.includes(record.get("witness.siglum"))) {
                        wit_temp.push(record.get("witness.siglum"));
                    };
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
                    if (!date_temp.includes(record.get("date.on"))) {
                        date_temp.push(record.get("date.on"));
                    };
                    if (!transl_temp.includes(record.get("translation.value"))) {
                        if (record.get("translation.value") !== null) {
                            transl_temp.push(record.get("translation.value"));
                        };
                    };
                    transl_temp = transl_temp.reverse();

                    /* apparatus entry array */
                    if (!app_entry.includes(record.get("app_entry"))) {
                        app_entry.push(record.get("app_entry"));
                    };

                },
                onCompleted: () => {

                    /* lemmas */
                    var lemmas = [];

                    /* all entries dict */
                    var allEntryDict = [];

                    if (app_entry.length > 1) {

                        /* lemmas */
                        for (var i = 0; i < app_entry.length; i++) {
                            var obj = app_entry[i];
                            var lemma = obj["segments"][0]["end"]["properties"]["value"];
                            if (!lemmas.includes(lemma)) {
                                lemmas.push(lemma);
                            };
                        };

                        /* lemma / variants */
                        lemmas.forEach((el) => {

                            /* lemma */
                            var lemma = el;

                            /* variant / witnesses dict */
                            var variantWitnessesDict = [];

                            /* apparatus entry dict */
                            var entryDict = [];

                            /* variants */
                            var variants = [];
                            for (var i = 0; i < app_entry.length; i++) {
                                var obj = app_entry[i];
                                if (lemma == obj["segments"][0]["end"]["properties"]["value"]) {
                                    obj["segments"].forEach((el) => {
                                        if (el["relationship"]["type"] == "ATTESTED_IN") {
                                            var variant = el["start"]["properties"]["value"];
                                            if (!variants.includes(variant)) {
                                                variants.push(variant);
                                            };
                                        };
                                    });
                                };
                            };

                            /* witnesses */
                            variants.forEach((variant) => {
                                /* witnesses */
                                var witnesses = [];
                                for (var i = 0; i < app_entry.length; i++) {
                                    var obj = app_entry[i];
                                    obj["segments"].forEach((el) => {
                                        if (el["relationship"]["type"] == "ATTESTED_IN") {
                                            if (el["start"]["properties"]["value"] == variant) {
                                                var witness = el["end"]["properties"]["siglum"];
                                                if (!witnesses.includes(witness)) {
                                                    witnesses.push(witness);
                                                };
                                            };
                                        };
                                    });
                                };
                                /* variant / witness dict */
                                variantWitnessesDict.push({
                                    variant: variant,
                                    witnesses: witnesses
                                });                                
                            });

                            /* lemma / variant / witnesses dict */
                            entryDict.push({
                                lemma: lemma,
                                variants: variantWitnessesDict
                            });

                            /* list of all the entries dict */
                            if (!allEntryDict.includes(entryDict)) {
                                allEntryDict.push(entryDict);
                            };

                        });
                    };

                    /* page rendering */
                    if (fs.existsSync(path)) {
                        res.render("edit", {
                            id: req.params.id,
                            work: work_temp,
                            title: title_temp,
                            author: auth_temp,
                            editor: ed_temp,
                            date: date_temp,
                            sigla: wit_temp,
                            file: file,
                            translation: transl_temp,
                            app_entry: allEntryDict
                        });
                    } else {
                        res.render("edit", {
                            id: req.params.id,
                            work: work_temp,
                            title: title_temp,
                            author: auth_temp,
                            editor: ed_temp,
                            date: date_temp,
                            sigla: wit_temp,
                            file: false,
                            translation: transl_temp,
                            app_entry: allEntryDict
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
                    SET edition.title = "${req.body.title}", date.on = "${req.body.date}", editor.name = "${req.body.editor}", work.title = "${req.body.work}", author.name = "${req.body.author}"
                ON MATCH 
                    SET edition.title = "${req.body.title}", date.on = "${req.body.date}", editor.name = "${req.body.editor}", work.title = "${req.body.work}", author.name = "${req.body.author}"
                RETURN edition.title, date.on, editor.name, work.title, author.name, witness.siglum, file.name
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