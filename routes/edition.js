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

    /* previous url */
    var prevUrl;

    /* update the second url to become the previous one in the next page */
    res.cookie("test_url_1", req.cookies["test_url_2"], { overwrite: true });
    res.cookie("test_url_2", req.originalUrl, { overwrite: true });

    /* store the current url in a cookie */
    if (req.originalUrl !== req.cookies["test_url_2"]) {
        req.cookies["test_url_1"] = req.cookies["test_url_2"];
        prevUrl = req.cookies["test_url_1"];
    } else {
        const { headers: { cookie } } = req;
        if (cookie) {
            const values = cookie.split(';').reduce((res, item) => {
                const data = item.trim().split('=');
                return { ...res, [data[0]]: data[1] };
            }, {});
            res.locals.cookie = values;
        }
        else res.locals.cookie = {};

        prevUrl = res.locals.cookie["test_url_1"].replace(/%2F/g, "/");
    };

    /* url of the current page */
    const idEdition = req.params.id.split("/").pop().split("-")[0];
    const idEditor = req.params.id.split("/").pop().split("-")[1];

    /* data of the edition */
    var file = `${idEdition}-${idEditor}.html`;
    var path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;
    var workMatrix;
    var title;
    var editionOf;
    var authors = [];
    var date;
    var editors = [];
    var chapter;
    var translation_temp = [];
    var commentary_temp = [];
    var parallels_temp = [];
    var citations_temp = [];
    var notes_temp = [];
    var witnesses_temp = [];

    /* APPARATUS */
    //////////////////////////////////
    var lemmaWitness_temp = [];
    var lemmaVariantWitness_temp = [];
    var apparatus = [];
    //////////////////////////////////

    const session = driver.session();
    try {
        await session.readTransaction(tx => tx
            .run(
                `
                MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)-[:EDITED_BY]->(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                OPTIONAL MATCH (edition)-[:PUBLISHED_ON]->(date:Date)
                OPTIONAL MATCH (edition)-[:HAS_FRAGMENT]->(selectedFragment:SelectedFragment)
                OPTIONAL MATCH (selectedFragment)-[:HAS_TRANSLATION]->(translation:Translation)
                OPTIONAL MATCH (selectedFragment)-[:IS_COMMENTED_IN]->(commentary:Commentary)
                OPTIONAL MATCH (selectedFragment)-[:HAS_PARALLEL]->(parallel:Parallel)
                OPTIONAL MATCH (parallel)<-[:HAS_FRAGMENT]-(parallelWork:Work)-[:WRITTEN_BY]->(parallelAuthor:Author)
                OPTIONAL MATCH (selectedFragment)-[:IS_A_CITATION_OF]->(citation:Citation)
                OPTIONAL MATCH (selectedFragment)-[:IS_DESCRIBED_IN]->(note:Note)
                OPTIONAL MATCH (edition)<-[:USED_IN]-(witness:Witness)
                OPTIONAL MATCH lemmaWitness = (selectedFragment)-[:HAS_LEMMA]->(lemma:Lemma)-[:ATTESTED_IN]->(lw:Witness)
                OPTIONAL MATCH lemmaVariantWitness = (lemma)-[:HAS_VARIANT]->(variant:Variant)-[:ATTESTED_IN]->(vw:Witness)
                RETURN work.title, edition.title, edition.editionOf, edition.authorCommentary, date.on, author.name, editor.name, selectedFragment.chapter, selectedFragment.stanzaStart, selectedFragment.stanzaEnd, selectedFragment.padaStart, selectedFragment.padaEnd, selectedFragment.value, ID(translation), translation.idAnnotation, translation.value, translation.note, ID(commentary), commentary.idAnnotation, commentary.value, commentary.note, commentary.translation, commentary.translationNote, ID(parallel), parallel.idAnnotation, parallel.book, parallel.bookChapter, parallel.bookStanza, parallel.note, parallel.value, parallelWork.title, parallelAuthor.name, ID(citation), citation.idAnnotation, citation.value, ID(note), note.idAnnotation, note.value, witness, lemmaWitness, lemmaVariantWitness
                `
            )
            .subscribe({
                onNext: record => {

                    /* work */
                    workMatrix = record.get("work.title");

                    /* title */
                    title = record.get("edition.title");

                    /* editionOf */
                    editionOf = record.get("edition.editionOf");

                    /* author(s) */
                    if (!authors.includes(record.get("author.name"))) {
                        authors.push(record.get("author.name"));
                    };

                    /* author of the commentary */
                    authorCommentary = record.get("edition.authorCommentary");

                    /* date */
                    date = record.get("date.on");

                    /* editor(s) */
                    if (!editors.includes(record.get("editor.name"))) {
                        editors.push(record.get("editor.name"));
                    };

                    /* chapter */
                    chapter = record.get("selectedFragment.chapter");

                    /* translations */
                    if (record.get("translation.value") !== null) {
                        /* translation entry */
                        var translation_entry = JSON.stringify({
                            id: record.get("ID(translation)")["low"],
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

                        /* array of translation entries */
                        if (!translation_temp.includes(translation_entry)) {
                            translation_temp.push(translation_entry);
                        };
                    };

                    /* commentary */
                    if (record.get("commentary.value") !== null) {
                        /* commentary entry */
                        var commentary_entry = JSON.stringify({
                            id: record.get("ID(commentary)")["low"],
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

                        /* array of commentary entries */
                        if (!commentary_temp.includes(commentary_entry)) {
                            commentary_temp.push(commentary_entry);
                        };
                    };

                    /* parallels */
                    if (record.get("parallel.value") !== null) {
                        var work = record.get("parallelWork.title") + "___" + record.get("parallelAuthor.name");

                        /* parallels entry */
                        var parallels_entry = JSON.stringify({
                            [work]: {
                                id: record.get("ID(parallel)")["low"],
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
                        });

                        /* array of commentary entries */
                        if (!parallels_temp.includes(parallels_entry)) {
                            parallels_temp.push(parallels_entry);
                        };
                    };

                    /* citations */
                    if (record.get("citation.value") !== null) {
                        /* citation entry */
                        var citations_entry = JSON.stringify({
                            id: record.get("ID(citation)")["low"],
                            idAnnotation: record.get("citation.idAnnotation"),
                            chapter: chapter,
                            stanzaStart: record.get("selectedFragment.stanzaStart"),
                            stanzaEnd: record.get("selectedFragment.stanzaEnd"),
                            padaStart: record.get("selectedFragment.padaStart"),
                            padaEnd: record.get("selectedFragment.padaEnd"),
                            fragment: record.get("selectedFragment.value"),
                            value: record.get("citation.value")
                        });

                        /* array of citation entries */
                        if (!citations_temp.includes(citations_entry)) {
                            citations_temp.push(citations_entry);
                        };
                    };

                    /* notes */
                    if (record.get("note.value") !== null) {
                        /* notes entry */
                        var notes_entry = JSON.stringify({
                            id: record.get("ID(note)")["low"],
                            idAnnotation: record.get("note.idAnnotation"),
                            chapter: chapter,
                            stanzaStart: record.get("selectedFragment.stanzaStart"),
                            stanzaEnd: record.get("selectedFragment.stanzaEnd"),
                            padaStart: record.get("selectedFragment.padaStart"),
                            padaEnd: record.get("selectedFragment.padaEnd"),
                            fragment: record.get("selectedFragment.value"),
                            value: record.get("note.value")
                        });

                        /* array of citation entries */
                        if (!notes_temp.includes(notes_entry)) {
                            notes_temp.push(notes_entry);
                        };
                    };

                    /* witnesses */
                    if (!witnesses_temp.includes(record.get("witness"))) {
                        witnesses_temp.push(record.get("witness"));
                    };

                    /* lemma / witnesses */
                    if (!lemmaWitness_temp.includes(record.get("lemmaWitness"))) {
                        lemmaWitness_temp.push(record.get("lemmaWitness"));
                    };

                    /* lemma / variant / witnesses */
                    if (!lemmaVariantWitness_temp.includes(record.get("lemmaVariantWitness"))) {
                        lemmaVariantWitness_temp.push(record.get("lemmaVariantWitness"));
                    };

                },
                onCompleted: () => {

                    /* TRANSLATIONS */
                    /* parse each translation in the array / string > JSON */
                    var translation = [];
                    translation_temp.forEach((el) => {
                        translation.push(JSON.parse(el));
                    });

                    /* order translations */
                    translation.sort((a, b) => {
                        return a.chapter - b.chapter;
                    });
                    translation.sort((a, b) => {
                        return a.stanzaStart - b.stanzaStart;
                    });
                    translation.sort((a, b) => {
                        return a.padaStart - b.padaStart;
                    });

                    /* COMMENTARY */
                    /* parse each commentary in the array / string > JSON */
                    var commentary = [];
                    commentary_temp.forEach((el) => {
                        commentary.push(JSON.parse(el));
                    });

                    /* order commentary */
                    commentary.sort((a, b) => {
                        return a.chapter - b.chapter;
                    });
                    commentary.sort((a, b) => {
                        return a.stanzaStart - b.stanzaStart;
                    });
                    commentary.sort((a, b) => {
                        return a.padaStart - b.padaStart;
                    });

                    /* PARALLELS */
                    /* parse each parallel in the array / string > JSON */
                    var all_parallels = [];
                    parallels_temp.forEach((el) => {
                        all_parallels.push(JSON.parse(el));
                    });

                    /* create an array of the parallels title */
                    var parallels_keys = [];
                    all_parallels.forEach((parallel) => {
                        for (const [key, value] of Object.entries(parallel)) {
                            if (!parallels_keys.includes(key)) {
                                parallels_keys.push(key);
                            };
                        }
                    });

                    /* create a dictionary for each parallel work / an array containing all the dictionaries */
                    var parallels = [];
                    parallels_keys.forEach((title) => {

                        /* create a dictionary of parallels for each title */
                        var work = {
                            [title]: {}
                        };

                        /* create an array of parallels values for each title */
                        var values = [];

                        /* assign the value to the dictionary */
                        all_parallels.forEach((parallel) => {
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
                        parallels.push(work);

                    });

                    /* CITATIONS */
                    /* parse each citation in the array / string > JSON */
                    var citations = [];
                    citations_temp.forEach((el) => {
                        citations.push(JSON.parse(el));
                    });

                    /* order citations */
                    citations.sort((a, b) => {
                        return a.stanzaStart - b.stanzaStart;
                    });
                    citations.sort((a, b) => {
                        return a.padaStart - b.padaStart;
                    });

                    /* NOTES */
                    /* parse each note in the array / string > JSON */
                    var notes = [];
                    notes_temp.forEach((el) => {
                        notes.push(JSON.parse(el));
                    });

                    /* order notes */
                    notes.sort((a, b) => {
                        return a.stanzaStart - b.stanzaStart;
                    });
                    notes.sort((a, b) => {
                        return a.padaStart - b.padaStart;
                    });

                    /* WITNESSES */
                    /* order witnesses */
                    var witnesses = [];
                    witnesses_temp.forEach((witness) => {
                        if (witness) {
                            if (!witnesses.includes(witness["properties"])) {
                                witnesses.push(witness["properties"]);
                            };
                        };
                    });

                    /* APPARATUS */
                    /* create an array of lemmas */
                    var lemmas = [];
                    var lemmas_attested_in_relations = [];
                    lemmaWitness_temp.forEach((el) => {
                        if (el !== null) {
                            /* location */
                            var chapter = el["start"]["properties"]["chapter"];
                            var stanzaStart = el["start"]["properties"]["stanzaStart"];
                            var stanzaEnd = el["start"]["properties"]["stanzaEnd"];
                            var padaStart = el["start"]["properties"]["padaStart"];
                            var padaEnd = el["start"]["properties"]["padaEnd"];

                            el["segments"].forEach((segment) => {
                                if (segment["start"]["labels"] == "Lemma") {

                                    /* lemma */
                                    var lemma = segment["start"]["properties"]["value"];

                                    /* lemma dict */
                                    var lemmaDict = JSON.stringify({
                                        id: segment["start"]["identity"]["low"],
                                        idAnnotation: segment["start"]["properties"]["idLemma"],
                                        lemma: lemma,
                                        chapter: chapter,
                                        stanzaStart: stanzaStart,
                                        stanzaEnd: stanzaEnd,
                                        padaStart: padaStart,
                                        padaEnd: padaEnd,
                                        notes: segment["start"]["properties"]["notes"]
                                    })

                                    /* array of lemmas */
                                    if (!lemmas.includes(lemmaDict)) {
                                        lemmas.push(lemmaDict);
                                    };

                                    /* array of attested in relation of lemma with witnesses */
                                    if (segment["relationship"]["type"] == "ATTESTED_IN") {
                                        var witness_relations = JSON.stringify(segment);
                                        if (!lemmas_attested_in_relations.includes(witness_relations)) {
                                            lemmas_attested_in_relations.push(witness_relations);
                                        };
                                    };

                                };
                            });
                        };
                    });

                    /* create a lemma / witnesses dict */
                    lemmas.forEach((el) => {

                        el = JSON.parse(el);
                        var lemma = el["lemma"];
                        var lemmaDict = el;
                        var lemma_witnesses_arr = [];
                        var variants_arr = [];
                        var variant_witnesses_data_arr = [];
                        var variants_dict = [];
                        var app_entry = [];

                        /* witnesses for each lemma */
                        lemmas_attested_in_relations.forEach((relation) => {
                            /* relation of lemma with witnesses / string > JSON */
                            relation = JSON.parse(relation);

                            /* array of witnesses for each lemma */
                            if (relation["start"]["properties"]["value"] == lemma) {
                                if (!lemma_witnesses_arr.includes(relation["end"]["properties"])) {
                                    lemma_witnesses_arr.push(relation["end"]["properties"]);
                                };
                            };
                        });

                        /* array of variants for each lemma */
                        lemmaVariantWitness_temp.forEach((el) => {
                            if (el["start"]["labels"] == "Lemma") {
                                if (el["start"]["properties"]["value"] == lemma) {
                                    el["segments"].forEach((segment) => {
                                        if (segment["start"]["labels"] == "Variant") {

                                            /* variant */
                                            var variant = segment["start"]["properties"]["value"];

                                            /* variant dict */
                                            var variantDict = JSON.stringify({
                                                idAnnotation: segment["start"]["properties"]["idVariant"],
                                                variant: variant,
                                                notes: segment["start"]["properties"]["notes"]
                                            })

                                            /* array of variants */
                                            if (!variants_arr.includes(variantDict)) {
                                                variants_arr.push(variantDict);
                                            };

                                            /* array of attested in relation of variant with witnesses */
                                            if (segment["relationship"]["type"] == "ATTESTED_IN") {
                                                var witness_relations = JSON.stringify(segment);
                                                if (!variant_witnesses_data_arr.includes(witness_relations)) {
                                                    variant_witnesses_data_arr.push(witness_relations);
                                                };
                                            };

                                        };
                                    });
                                };
                            };
                        });

                        variants_arr.forEach((el) => {

                            el = JSON.parse(el);
                            var variant = el["variant"];
                            var variantDict = el;
                            var variant_witnesses_arr = [];

                            /* witnesses for each variant */
                            variant_witnesses_data_arr.forEach((relation) => {
                                /* relation of variant with witnesses / string > JSON */
                                relation = JSON.parse(relation);

                                /* array of witnesses for each variant */
                                if (relation["start"]["properties"]["value"] == variant) {
                                    if (!variant_witnesses_arr.includes(relation["end"]["properties"])) {
                                        variant_witnesses_arr.push(relation["end"]["properties"]);
                                    };
                                };
                            });

                            /* array of variant entry dict */
                            variants_dict.push({
                                variant: variantDict,
                                witnessesVariant: variant_witnesses_arr
                            });
                        });

                        /* app entry dict */
                        app_entry.push({
                            lemma: lemmaDict,
                            witnessesLemma: lemma_witnesses_arr,
                            variants: variants_dict
                        });

                        /* array of app entry */
                        apparatus.push(app_entry);

                    });

                    /* order the apparatus */
                    apparatus.sort((a, b) => {
                        return a[0]["lemma"]["chapter"] - b[0]["lemma"]["chapter"];
                    });
                    apparatus.sort((a, b) => {
                        return a[0]["lemma"]["stanzaStart"] - b[0]["lemma"]["stanzaStart"];
                    });
                    apparatus.sort((a, b) => {
                        return a[0]["lemma"]["padaStart"] - b[0]["lemma"]["padaStart"];
                    });
                    apparatus.sort((a, b) => {
                        return a[0]["lemma"]["stanzaEnd"] - b[0]["lemma"]["stanzaEnd"];
                    });
                    apparatus.sort((a, b) => {
                        return a[0]["lemma"]["padaEnd"] - b[0]["lemma"]["padaEnd"];
                    });

                    /* PAGE RENDERING */
                    if (fs.existsSync(path)) {
                        res.render("edition", {
                            prevUrl: prevUrl,
                            id: req.params.id,
                            name: req.user.name,
                            work: workMatrix,
                            title: title,
                            editionOf: editionOf,
                            authors: authors,
                            authorCommentary: authorCommentary,
                            date: date,
                            editors: editors,
                            file: file,
                            chapter: chapter,
                            translation: translation,
                            commentary: commentary,
                            parallels: parallels,
                            citations: citations,
                            notes: notes,
                            witnesses: witnesses,
                            apparatus: apparatus
                        });
                    } else {
                        res.render("edition", {
                            prevUrl: prevUrl,
                            id: req.params.id,
                            name: req.user.name,
                            work: workMatrix,
                            title: title,
                            editionOf: editionOf,
                            authors: authors,
                            authorCommentary: authorCommentary,
                            date: date,
                            editors: editors,
                            file: false,
                            chapter: chapter,
                            translation: translation,
                            commentary: commentary,
                            parallels: parallels,
                            citations: citations,
                            notes: notes,
                            witnesses: witnesses,
                            apparatus: apparatus
                        });
                    };

                },
                onError: err => {
                    console.log(err);
                }
            })
        );
    } catch (err) {
        console.log(err);
    } finally {
        await session.close();
    };
});

module.exports = router;