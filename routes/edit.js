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
    var editionOf;
    var authorCommentary_temp = [];
    var auth_temp = [];
    var ed_temp = [];
    var date_temp = [];
    var wit_temp = [];
    var apparatus_entry = [];
    var witnesses_relations = [];
    var translation_temp = [];
    var parallel_temp = [];
    var commentary_temp = [];
    var citation_temp = [];

    const session = driver.session();
    try {
        await session.readTransaction(tx => tx
            .run(
                `
                MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)-[:EDITED_BY]->(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                OPTIONAL MATCH (edition)-[:PUBLISHED_ON]->(date:Date)
                OPTIONAL MATCH apparatus_entry = (edition)-[:HAS_FRAGMENT]->(selectedFragment:SelectedFragment)-[:HAS_LEMMA]->(lemma:Lemma)-[:HAS_VARIANT]->(variant:Variant)
                OPTIONAL MATCH witnesses_relations = ()-[:ATTESTED_IN]->()
                OPTIONAL MATCH (witness)-[:USED_IN]->(edition)
                OPTIONAL MATCH translation_entry = (edition)-[:HAS_FRAGMENT]->()-[:HAS_TRANSLATION]->(translation:Translation)
                OPTIONAL MATCH parallel_entry = (edition)-[:HAS_FRAGMENT]->()-[:HAS_PARALLEL]->(parallel:Parallel)
                OPTIONAL MATCH commentary_entry = (edition)-[:HAS_FRAGMENT]->()-[:HAS_COMMENTARY]->(commentary:Commentary)
                OPTIONAL MATCH citation_entry = (edition)-[:HAS_FRAGMENT]->()-[:IS_A_CITATION_OF]->(citation:Citation)
                RETURN work.title, edition.title, edition.editionOf, edition.authorCommentary, author.name, editor.name, witness.siglum, date.on, apparatus_entry, witnesses_relations, translation_entry, parallel_entry, commentary_entry, citation_entry
                `
            )
            .subscribe({
                onNext: record => {
                    /* witness sigla */
                    if (!wit_temp.includes(record.get("witness.siglum"))) {
                        wit_temp.push(record.get("witness.siglum"));
                    };
                    /* work */
                    if (!work_temp.includes(record.get("work.title"))) {
                        work_temp.push(record.get("work.title"));
                    };
                    /* edition of */
                    editionOf = record.get("edition.editionOf");
                    /* author of commentary */
                    if (!authorCommentary_temp.includes(record.get("edition.authorCommentary"))) {
                        authorCommentary_temp.push(record.get("edition.authorCommentary"));
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
                    /* date */
                    if (!date_temp.includes(record.get("date.on"))) {
                        date_temp.push(record.get("date.on"));
                    };
                    /* apparatus */
                    if (!apparatus_entry.includes(record.get("apparatus_entry"))) {
                        if (record.get("apparatus_entry") !== null) {
                            apparatus_entry.push(record.get("apparatus_entry"));
                        };
                    };
                    /* witnesses relations array */
                    if (!witnesses_relations.includes(record.get("witnesses_relations"))) {
                        if (record.get("witnesses_relations") !== null) {
                            witnesses_relations.push(record.get("witnesses_relations"));
                        };
                    };
                    /* translations */
                    if (!translation_temp.includes(record.get("translation_entry"))) {
                        if (record.get("translation_entry") !== null) {
                            translation_temp.push(record.get("translation_entry"));
                        };
                    };
                    /* parallels */
                    if (!parallel_temp.includes(record.get("parallel_entry"))) {
                        if (record.get("parallel_entry") !== null) {
                            parallel_temp.push(record.get("parallel_entry"));
                        };
                    };
                    /* commentary */
                    if (!commentary_temp.includes(record.get("commentary_entry"))) {
                        if (record.get("commentary_entry") !== null) {
                            commentary_temp.push(record.get("commentary_entry"));
                        };
                    };
                    /* citations */
                    if (!citation_temp.includes(record.get("citation_entry"))) {
                        if (record.get("citation_entry") !== null) {
                            citation_temp.push(record.get("citation_entry"));
                        };
                    };
                },
                onCompleted: () => {

                    /* APPARATUS */
                    /* lemmas */
                    var lemmas = [];

                    /* all entries dict */
                    var appEntryDict = [];

                    if (apparatus_entry.length > 0) {

                        if (witnesses_relations.length > 0) {

                            /* lemmas */
                            for (var i = 0; i < apparatus_entry.length; i++) {
                                var obj = apparatus_entry[i];
                                var lemma = obj["segments"][0]["end"]["properties"]["value"];
                                if (!lemmas.includes(lemma)) {
                                    lemmas.push(lemma);
                                };
                            };

                            /* lemma / variants */
                            lemmas.forEach((el) => {
                                /* lemma */
                                var lemma = el;

                                /* stanza start / pada start / stanza end / pada end / truncation / notes / lemma dictionary */
                                var stanzaStart = [];
                                var padaStart = [];
                                var stanzaEnd = [];
                                var padaEnd = [];
                                var truncation = [];
                                var notes = [];
                                var lemmaDict = []

                                /* witnesses */
                                var witnesses = [];

                                for (var i = 0; i < apparatus_entry.length; i++) {
                                    var obj = apparatus_entry[i];
                                    if (lemma == obj["segments"][0]["end"]["properties"]["value"]) {
                                        obj["segments"].forEach((el) => {
                                            if (el["relationship"]["type"] == "HAS_LEMMA") {
                                                /* stanza start */
                                                var stanza = el["start"]["properties"]["stanzaStart"];
                                                if (!stanzaStart.includes(stanza)) {
                                                    stanzaStart.push(stanza);
                                                };
                                                /* pada start */
                                                var pada = el["start"]["properties"]["padaStart"];
                                                if (!padaStart.includes(pada)) {
                                                    padaStart.push(pada);
                                                };
                                                /* stanza end */
                                                var stanza = el["start"]["properties"]["stanzaEnd"];
                                                if (!stanzaEnd.includes(stanza)) {
                                                    stanzaEnd.push(stanza);
                                                };
                                                /* pada end */
                                                var pada = el["start"]["properties"]["padaEnd"];
                                                if (!padaEnd.includes(pada)) {
                                                    padaEnd.push(pada);
                                                };
                                                /* truncation */
                                                var truncationVal = el["end"]["properties"]["truncation"];
                                                if (truncationVal !== undefined) {
                                                    if (!truncation.includes(truncationVal)) {
                                                        truncation.push(truncationVal);
                                                    };
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
                                    witnesses: witnesses.join(" ; "),
                                    stanzaStart: stanzaStart,
                                    padaStart: padaStart,
                                    stanzaEnd: stanzaEnd,
                                    padaEnd: padaEnd,
                                    truncation: truncation,
                                    notes: notes
                                });

                                /* variant / witnesses dict */
                                var variantDict = [];

                                /* apparatus entry dict */
                                var entryDict = [];

                                /* variants */
                                var variants = [];
                                for (var i = 0; i < apparatus_entry.length; i++) {
                                    var obj = apparatus_entry[i];
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
                                    var numbers = [];
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
                                                /* number */
                                                var number = obj["start"]["properties"]["number"];
                                                if (!numbers.includes(number)) {
                                                    numbers.push(number);
                                                };
                                                /* notes */
                                                var note = obj["start"]["properties"]["notes"];
                                                if (note !== "") {
                                                    if (!notes.includes(note)) {
                                                        notes.push(note);
                                                    };
                                                };
                                            };
                                        };
                                    };

                                    /* variant / witness dict */
                                    variantDict.push({
                                        variant: variant,
                                        witnesses: witnesses.join(" ; "),
                                        numbers: numbers,
                                        notes: notes
                                    });

                                });

                                /* lemma / variant / witnesses dict */
                                entryDict.push({
                                    lemma: lemmaDict,
                                    variants: variantDict
                                });

                                /* list of all the entries dict */
                                if (!appEntryDict.includes(entryDict)) {
                                    appEntryDict.push(entryDict);
                                };
                            });
                        };
                    } else {
                        appEntryDict = [];
                    };

                    /* TRANSLATIONS */
                    var translArr = [];
                    if (translation_temp.length > 0) {
                        for (var i = 0; i < translation_temp.length; i++) {
                            var obj = translation_temp[i];

                            /* translation */
                            var transl = obj["end"]["properties"]["value"];

                            /* stanzas / padas */
                            var stanzaStart = obj["end"]["properties"]["stanzaStart"];
                            var stanzaEnd = obj["end"]["properties"]["stanzaStart"];
                            var padaStart = obj["end"]["properties"]["padaStart"];
                            if (padaStart == "undefined" || padaStart.includes("a") && padaStart.includes("b") && padaStart.includes("c") && padaStart.includes("d") && padaStart.includes("e") && padaStart.includes("f")) {
                                padaStart = "";
                            };

                            var padaEnd = obj["end"]["properties"]["padaStart"];
                            if (padaEnd == "undefined" || padaEnd.includes("a") && padaEnd.includes("b") && padaEnd.includes("c") && padaEnd.includes("d") && padaEnd.includes("e") && padaEnd.includes("f")) {
                                padaEnd = "";
                            };

                            if (stanzaStart + padaStart == stanzaEnd + padaEnd) {
                                stanzaEnd = "";
                                padaEnd = "";
                            };

                            /* fragment */
                            var fragment;
                            obj["segments"].forEach((el) => {
                                if (el["relationship"]["type"] == "HAS_FRAGMENT") {
                                    fragment = el["end"]["properties"]["value"];
                                };
                            });

                            /* tranlation entry */
                            var translEntry = stanzaStart + "#" + padaStart + "-" + stanzaEnd + "#" + padaEnd + "___" + transl + "===" + fragment;

                            /* translations array */
                            if (!translArr.includes(translEntry)) {
                                translArr.push(translEntry);
                            };
                        };
                    };

                    /* PARALLELS */
                    var paralArr = [];
                    if (parallel_temp.length > 0) {
                        for (var i = 0; i < parallel_temp.length; i++) {
                            var obj = parallel_temp[i];

                            /* parallel */
                            var parallel = obj["end"]["properties"]["value"];

                            /* stanzas / padas */
                            var stanzaStart = obj["end"]["properties"]["stanzaStart"];
                            var stanzaEnd = obj["end"]["properties"]["stanzaStart"];
                            var padaStart = obj["end"]["properties"]["padaStart"];

                            if (padaStart == "undefined" || padaStart.includes("a") && padaStart.includes("b") && padaStart.includes("c") && padaStart.includes("d") && padaStart.includes("e") && padaStart.includes("f")) {
                                padaStart = "";
                            };

                            var padaEnd = obj["end"]["properties"]["padaStart"];
                            if (padaEnd == "undefined" || padaEnd.includes("a") && padaEnd.includes("b") && padaEnd.includes("c") && padaEnd.includes("d") && padaEnd.includes("e") && padaEnd.includes("f")) {
                                padaEnd = "";
                            };

                            if (stanzaStart + padaStart == stanzaEnd + padaEnd) {
                                stanzaEnd = "";
                                padaEnd = "";
                            };

                            /* fragment */
                            var fragment;
                            obj["segments"].forEach((el) => {
                                if (el["relationship"]["type"] == "HAS_FRAGMENT") {
                                    fragment = el["end"]["properties"]["value"];
                                };
                            });

                            /* parallel entry */
                            var paralEntry = stanzaStart + "#" + padaStart + "-" + stanzaEnd + "#" + padaEnd + "___" + parallel + "===" + fragment;

                            /* parallels array */
                            if (!paralArr.includes(paralEntry)) {
                                paralArr.push(paralEntry);
                            };

                        };
                    };

                    /* COMMENTARY */
                    var commArr = [];
                    if (commentary_temp.length > 0) {
                        for (var i = 0; i < commentary_temp.length; i++) {
                            var obj = commentary_temp[i];

                            /* commentary */
                            var commentary = obj["end"]["properties"]["value"];

                            /* stanzas / padas */
                            var stanzaStart = obj["end"]["properties"]["stanzaStart"];
                            var stanzaEnd = obj["end"]["properties"]["stanzaStart"];
                            var padaStart = obj["end"]["properties"]["padaStart"];

                            if (padaStart == "undefined" || padaStart.includes("a") && padaStart.includes("b") && padaStart.includes("c") && padaStart.includes("d") && padaStart.includes("e") && padaStart.includes("f")) {
                                padaStart = "";
                            };

                            var padaEnd = obj["end"]["properties"]["padaStart"];
                            if (padaEnd == "undefined" || padaEnd.includes("a") && padaEnd.includes("b") && padaEnd.includes("c") && padaEnd.includes("d") && padaEnd.includes("e") && padaEnd.includes("f")) {
                                padaEnd = "";
                            };

                            if (stanzaStart + padaStart == stanzaEnd + padaEnd) {
                                stanzaEnd = "";
                                padaEnd = "";
                            };

                            /* fragment */
                            var fragment;
                            obj["segments"].forEach((el) => {
                                if (el["relationship"]["type"] == "HAS_FRAGMENT") {
                                    fragment = el["end"]["properties"]["value"];
                                };
                            });

                            /* commentary entry */
                            var commEntry = stanzaStart + "#" + padaStart + "-" + stanzaEnd + "#" + padaEnd + "___" + commentary + "===" + fragment;

                            /* commentary array */
                            if (!commArr.includes(commEntry)) {
                                commArr.push(commEntry);
                            };

                        };
                    };

                    /* CITATIONS */
                    var citArr = [];
                    if (citation_temp.length > 0) {
                        for (var i = 0; i < citation_temp.length; i++) {
                            var obj = citation_temp[i];

                            /* citation */
                            var citation = obj["end"]["properties"]["value"];

                            /* stanzas / padas */
                            var stanzaStart = obj["end"]["properties"]["stanzaStart"];
                            var stanzaEnd = obj["end"]["properties"]["stanzaStart"];
                            var padaStart = obj["end"]["properties"]["padaStart"];

                            if (padaStart == "undefined" || padaStart.includes("a") && padaStart.includes("b") && padaStart.includes("c") && padaStart.includes("d") && padaStart.includes("e") && padaStart.includes("f")) {
                                padaStart = "";
                            };

                            var padaEnd = obj["end"]["properties"]["padaStart"];
                            if (padaEnd == "undefined" || padaEnd.includes("a") && padaEnd.includes("b") && padaEnd.includes("c") && padaEnd.includes("d") && padaEnd.includes("e") && padaEnd.includes("f")) {
                                padaEnd = "";
                            };

                            if (stanzaStart + padaStart == stanzaEnd + padaEnd) {
                                stanzaEnd = "";
                                padaEnd = "";
                            };

                            /* fragment */
                            var fragment;
                            obj["segments"].forEach((el) => {
                                if (el["relationship"]["type"] == "HAS_FRAGMENT") {
                                    fragment = el["end"]["properties"]["value"];
                                };
                            });

                            /* citation entry */
                            var citEntry = stanzaStart + "#" + padaStart + "-" + stanzaEnd + "#" + padaEnd + "___" + citation + "===" + fragment;

                            /* commentary array */
                            if (!citArr.includes(citEntry)) {
                                citArr.push(citEntry);
                            };

                        };
                    };

                    /* page rendering */
                    if (fs.existsSync(path)) {
                        res.render("edit", {
                            id: req.params.id,
                            name: req.user.name,
                            work: work_temp,
                            title: title_temp,
                            editionOf: editionOf,
                            authorCommentary: authorCommentary_temp,
                            author: auth_temp,
                            editor: ed_temp,
                            date: date_temp,
                            sigla: wit_temp,
                            file: file,
                            appEntryDict: appEntryDict,
                            translations: translArr,
                            parallels: paralArr,
                            commentaries: commArr,
                            citations: citArr
                        });
                    } else {
                        res.render("edit", {
                            id: req.params.id,
                            name: req.user.name,
                            work: work_temp,
                            title: title_temp,
                            editionOf: editionOf,
                            authorCommentary: authorCommentary_temp,
                            author: auth_temp,
                            editor: ed_temp,
                            date: date_temp,
                            sigla: wit_temp,
                            file: false,
                            appEntryDict: appEntryDict,
                            translations: translArr,
                            parallels: paralArr,
                            commentaries: commArr,
                            citations: citArr
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