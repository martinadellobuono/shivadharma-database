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
    var work_temp = [];
    var title_temp = [];
    var auth_temp = [];
    var ed_temp = [];
    var date_temp = [];
    var wit_temp = [];
    var transl_temp = [];
    var app_entry = [];
    var witnesses_relations = [];

    const session = driver.session();
    try {
        await session.readTransaction(tx => tx
            .run(
                `
                MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)-[:EDITED_BY]->(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                OPTIONAL MATCH (edition)-[:PUBLISHED_ON]->(date:Date)
            
                OPTIONAL MATCH app_entry = (selectedFragment:SelectedFragment)-[:HAS_LEMMA]->(lemma:Lemma)-[:HAS_VARIANT]->(variant:Variant)

                OPTIONAL MATCH witnesses_relations = ()-[:ATTESTED_IN]->()

                OPTIONAL MATCH (witness)-[:USED_IN]->(edition)

                OPTIONAL MATCH (edition)-[:HAS_FRAGMENT]->(selectedFragment:SelectedFragment)-[:HAS_TRANSLATION]->(translation:Translation)
                
                RETURN work.title, edition.title, author.name, editor.name, witness.siglum, date.on, translation.value, app_entry, witnesses_relations
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

                    /* apparatus entry array */
                    if (!app_entry.includes(record.get("app_entry"))) {
                        if (record.get("app_entry") !== null) {
                            app_entry.push(record.get("app_entry"));
                        };
                    };

                    /* witnesses relations array */
                    if (!witnesses_relations.includes(record.get("witnesses_relations"))) {
                        if (record.get("witnesses_relations") !== null) {
                            witnesses_relations.push(record.get("witnesses_relations"));
                        };
                    };

                },
                onCompleted: () => {

                    /* lemmas */
                    var lemmas = [];

                    /* all entries dict */
                    var allEntryDict = [];

                    if (app_entry.length > 0) {

                        if (witnesses_relations.length > 0) {

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

                                /* stanzas / padas / notes / lemma dictionary */
                                var stanzas = [];
                                var padas = [];
                                var notes = [];
                                var lemmaDict = []

                                /* witnesses */
                                var witnesses = [];

                                for (var i = 0; i < app_entry.length; i++) {
                                    var obj = app_entry[i];
                                    if (lemma == obj["segments"][0]["end"]["properties"]["value"]) {
                                        obj["segments"].forEach((el) => {
                                            if (el["relationship"]["type"] == "HAS_LEMMA") {
                                                /* stanzas */
                                                var stanza = el["start"]["properties"]["stanza"];
                                                if (!stanzas.includes(stanza)) {
                                                    stanzas.push(stanza);
                                                };
                                                /* padas */
                                                var pada = el["start"]["properties"]["pada"];
                                                if (!padas.includes(pada)) {
                                                    padas.push(pada);
                                                };
                                                /* notes */
                                                var note = el["end"]["properties"]["notes"];
                                                if (!notes.includes(note)) {
                                                    notes.push(note);
                                                };
                                            };
                                        });
                                    };
                                };

                                /* lemma witnesses */
                                for (var i = 0; i < witnesses_relations.length; i++) {
                                    var obj = witnesses_relations[i];
                                    if (obj["start"]["labels"] == "Lemma") {
                                        if (lemma == obj["start"]["properties"]["value"]) {
                                            var witness = obj["end"]["properties"]["siglum"];
                                            if (!witnesses.includes(witness)) {
                                                witnesses.push(witness);
                                            };
                                        };
                                    };
                                };

                                /* lemma / witnesses / stanza / pada dict */
                                lemmaDict.push({
                                    lemma: lemma,
                                    witnesses: witnesses,
                                    stanza: stanzas,
                                    pada: padas,
                                    notes: notes
                                });

                                /* variant / witnesses dict */
                                var variantDict = [];

                                /* apparatus entry dict */
                                var entryDict = [];

                                /* variants */
                                var variants = [];
                                for (var i = 0; i < app_entry.length; i++) {
                                    var obj = app_entry[i];
                                    if (lemma == obj["segments"][0]["end"]["properties"]["value"]) {
                                        obj["segments"].forEach((el) => {
                                            if (el["relationship"]["type"] == "HAS_VARIANT") {
                                                var variant = el["end"]["properties"]["value"];
                                                if (!variants.includes(variant)) {
                                                    variants.push(variant);
                                                };
                                            };
                                        });
                                    };
                                };

                                /* witnesses */
                                variants.forEach((variant) => {
                                    var witnesses = [];
                                    var notes = [];

                                    for (var i = 0; i < witnesses_relations.length; i++) {
                                        var obj = witnesses_relations[i];

                                        /* variant / witnesses / notes */
                                        if (obj["start"]["labels"] == "Variant") {
                                            if (obj["start"]["properties"]["value"] == variant) {
                                                /* witnesses */
                                                var witness = obj["end"]["properties"]["siglum"];
                                                if (!witnesses.includes(witness)) {
                                                    witnesses.push(witness);
                                                };
                                                /* notes */
                                                var note = obj["start"]["properties"]["notes"];
                                                if (!notes.includes(note)) {
                                                    notes.push(note);
                                                };
                                            };
                                        };
                                    };

                                    /* variant / witness dict */
                                    variantDict.push({
                                        variant: variant,
                                        witnesses: witnesses,
                                        notes: notes
                                    });

                                });

                                /* lemma / variant / witnesses dict */
                                entryDict.push({
                                    lemma: lemmaDict,
                                    variants: variantDict
                                });

                                /* list of all the entries dict */
                                if (!allEntryDict.includes(entryDict)) {
                                    allEntryDict.push(entryDict);
                                };
                            });
                        };
                    } else {
                        allEntryDict = [];
                    };

                    /* page rendering */
                    if (fs.existsSync(path)) {
                        res.render("edit", {
                            id: req.params.id,
                            name: req.user.name,
                            work: work_temp,
                            title: title_temp,
                            author: auth_temp,
                            editor: ed_temp,
                            date: date_temp,
                            sigla: wit_temp,
                            file: file,
                            translation: transl_temp,
                            allEntryDict: allEntryDict
                        });
                    } else {
                        res.render("edit", {
                            id: req.params.id,
                            name: req.user.name,
                            work: work_temp,
                            title: title_temp,
                            author: auth_temp,
                            editor: ed_temp,
                            date: date_temp,
                            sigla: wit_temp,
                            file: false,
                            translation: transl_temp,
                            allEntryDict: allEntryDict
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