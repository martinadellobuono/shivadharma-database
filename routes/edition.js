const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.get(process.env.URL_PATH + "/edition/:id", async (req, res) => {
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
    var editionLanguage;
    var editors = [];
    var secondaryEditors = [];
    var contributors = [];
    var chapter;
    var translation_temp = [];
    var translation_lang = [];
    var commentary_temp = [];
    var parallels_temp = [];
    var citations_temp = [];
    var notes_temp = [];
    var language_temp = [];
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
                MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                OPTIONAL MATCH (allEditors:Editor)-[:IS_EDITOR_OF]->(edition)
                OPTIONAL MATCH (secondaryEditors:Editor)-[:IS_SECONDARY_EDITOR_OF]->(edition)
                OPTIONAL MATCH (contributor:Editor)-[:IS_CONTRIBUTOR_OF]->(edition)
                OPTIONAL MATCH (edition)-[:PUBLISHED_ON]->(date:Date)
                OPTIONAL MATCH (edition)-[:WRITTEN_IN]->(language:Language)
                OPTIONAL MATCH (edition)-[:HAS_FRAGMENT]->(selectedFragment:SelectedFragment)
                OPTIONAL MATCH (selectedFragment)-[:HAS_TRANSLATION]->(translation:Translation)
                OPTIONAL MATCH (selectedFragment)-[:IS_COMMENTED_IN]->(commentary:Commentary)
                OPTIONAL MATCH (selectedFragment)-[:HAS_PARALLEL]->(parallel:Parallel)
                OPTIONAL MATCH (parallel)<-[:HAS_FRAGMENT]-(parallelWork:Work)-[:WRITTEN_BY]->(parallelAuthor:Author)
                OPTIONAL MATCH (selectedFragment)-[:IS_A_CITATION_OF]->(citation:Citation)
                OPTIONAL MATCH (selectedFragment)-[:IS_DESCRIBED_IN]->(note:Note)
                OPTIONAL MATCH (selectedFragment)-[:HAS_TRANSLATION]->(languageTranslation:languageTranslation)
                OPTIONAL MATCH (edition)<-[:USED_IN]-(witness:Witness)
                OPTIONAL MATCH lemmaWitness = (selectedFragment)-[:HAS_LEMMA]->(lemma:Lemma)-[:ATTESTED_IN]->(lw:Witness)
                OPTIONAL MATCH lemmaVariantWitness = (lemma)-[:HAS_VARIANT]->(variant:Variant)-[:ATTESTED_IN]->(vw:Witness)
                RETURN work.title, edition.title, edition.editionOf, edition.authorCommentary, allEditors.name, contributor.name, date.on, language.name, author.name, editor.name, selectedFragment.idAnnotation, selectedFragment.chapter, selectedFragment.stanzaStart, selectedFragment.stanzaEnd, selectedFragment.padaStart, selectedFragment.padaEnd, selectedFragment.value, ID(translation), translation.idAnnotation, translation.langTranslation, translation.value, translation.note, ID(commentary), commentary.idAnnotation, commentary.value, commentary.note, commentary.translation, commentary.translationNote, ID(parallel), parallel.idAnnotation, parallel.book, parallel.bookChapter, parallel.bookStanza, parallel.note, parallel.value, parallelWork.title, parallelAuthor.name, ID(citation), citation.idAnnotation, citation.value, citation.note, ID(note), note.idAnnotation, note.value, ID(languageTranslation), languageTranslation.idAnnotation, languageTranslation.value, languageTranslation.note, languageTranslation.translation, languageTranslation.translationNote, languageTranslation.intro, languageTranslation.commentary, languageTranslation.commentaryTranslation, witness, lemmaWitness, lemmaVariantWitness, secondaryEditors.name
                `
            )
            .subscribe({
                onNext: record => {
                    /* work */
                    if (record.get("work.title") !== null) {
                        workMatrix = record.get("work.title");
                    };

                    /* title */
                    if (record.get("edition.title") !== null) {
                        title = record.get("edition.title");
                    };

                    /* editionOf */
                    if (record.get("edition.editionOf") !== null) {
                        editionOf = record.get("edition.editionOf");
                    };

                    /* author(s) */
                    if (!authors.includes(record.get("author.name"))) {
                        if (record.get("author.name") !== null) {
                            authors.push(record.get("author.name"));
                        };
                    };

                    /* author of the commentary */
                    if (record.get("edition.authorCommentary") !== null) {
                        authorCommentary = record.get("edition.authorCommentary");
                    };

                    /* date */
                    if (record.get("date.on") !== null) {
                        date = record.get("date.on");
                    };

                    /* edition language */
                    if (record.get("language.name") !== null) {
                        editionLanguage = record.get("language.name");
                    };

                    /* editor(s) */
                    if (!editors.includes(record.get("allEditors.name"))) {
                        if (record.get("allEditors.name") !== null) {
                            editors.push(record.get("allEditors.name"));
                        };
                    };

                    /* secondary editor(s) */
                    if (!secondaryEditors.includes(record.get("secondaryEditors.name"))) {
                        if (record.get("secondaryEditors.name") !== null) {
                            secondaryEditors.push(record.get("secondaryEditors.name"));
                        };
                    };

                    /* contributors(s) */
                    if (!contributors.includes(record.get("contributor.name"))) {
                        if (record.get("contributor.name") !== null) {
                            contributors.push(record.get("contributor.name"));
                        };
                    };

                    /* chapter */
                    if (record.get("selectedFragment.chapter") !== null) {
                        chapter = record.get("selectedFragment.chapter");
                    };

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
                            langTranslation: record.get("translation.langTranslation"),
                            note: record.get("translation.note")
                        });

                        /* array of translation entries */
                        if (!translation_temp.includes(translation_entry)) {
                            translation_temp.push(translation_entry);
                        };

                        /* array of translation languages */
                        if (!translation_lang.includes(record.get("translation.langTranslation"))) {
                            translation_lang.push(record.get("translation.langTranslation"));
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
                            if (parallels_entry !== null) {
                                parallels_temp.push(parallels_entry);
                            };
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
                            value: record.get("citation.value"),
                            note: record.get("citation.note"),
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

                    /* language */
                    if (record.get("languageTranslation.value") !== null) {
                        /* notes entry */
                        var language_entry = JSON.stringify({
                            id: record.get("ID(languageTranslation)")["low"],
                            idAnnotation: record.get("languageTranslation.idAnnotation"),
                            chapter: chapter,
                            stanzaStart: record.get("selectedFragment.stanzaStart"),
                            stanzaEnd: record.get("selectedFragment.stanzaEnd"),
                            padaStart: record.get("selectedFragment.padaStart"),
                            padaEnd: record.get("selectedFragment.padaEnd"),
                            fragment: record.get("selectedFragment.value"),
                            value: record.get("languageTranslation.value"),
                            translation: record.get("languageTranslation.translation"),
                            note: record.get("languageTranslation.note"),
                            translationNote: record.get("languageTranslation.translationNote"), 
                            intro: record.get("languageTranslation.intro"),
                            commentary: record.get("languageTranslation.commentary"),
                            commentaryTranslation: record.get("languageTranslation.commentaryTranslation")
                        });

                        /* array of language entries */
                        if (!language_temp.includes(language_entry)) {
                            language_temp.push(language_entry);
                        };
                    };

                    /* witnesses */
                    if (!witnesses_temp.includes(record.get("witness"))) {
                        if (record.get("witness") !== null) {
                            witnesses_temp.push(record.get("witness"));
                        };
                    };

                    /* lemma / witnesses */
                    if (!lemmaWitness_temp.includes(record.get("lemmaWitness"))) {
                        if (record.get("lemmaWitness") !== null) {
                            lemmaWitness_temp.push(record.get("lemmaWitness"));
                        };
                    };

                    /* lemma / variant / witnesses */
                    if (!lemmaVariantWitness_temp.includes(record.get("lemmaVariantWitness"))) {
                        if (record.get("lemmaVariantWitness") !== null) {
                            lemmaVariantWitness_temp.push(record.get("lemmaVariantWitness"));
                        };
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
                        return a.padaStart.localeCompare(b.padaStart);
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

                    /* LANGUAGE */
                    /* parse each language text in the array / string > JSON */
                    var language = [];
                    language_temp.forEach((el) => {
                        language.push(JSON.parse(el));
                    });

                    /* order language */
                    language.sort((a, b) => {
                        return a.stanzaStart - b.stanzaStart;
                    });
                    language.sort((a, b) => {
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
                            /* id app entry */
                            var idApp = el["start"]["properties"]["idAnnotation"];

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
                                        idApp: idApp,
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
                            if (el !== null) {
                                if (el["start"]["labels"] == "Lemma") {
                                    if (el["start"]["properties"]["value"] == lemma) {
                                        el["segments"].forEach((segment) => {
                                            if (segment["start"]["labels"] == "Variant") {

                                                /* variant */
                                                var variant = segment["start"]["properties"]["value"];

                                                /* variant dict */
                                                var variantDict = JSON.stringify({
                                                    idAnnotation: segment["start"]["properties"]["idVariant"],
                                                    value: segment["start"]["properties"]["value"],
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
                    function compare(a, b) {
                        if (a[0]["lemma"]["chapter"] !== b[0]["lemma"]["chapter"]) {
                            return a[0]["lemma"]["chapter"] - b[0]["lemma"]["chapter"];
                        };
                        if (a[0]["lemma"]["stanzaStart"] !== b[0]["lemma"]["stanzaStart"]) {
                            return a[0]["lemma"]["stanzaStart"] - b[0]["lemma"]["stanzaStart"];
                        }
                        if (a[0]["lemma"]["padaStart"] !== b[0]["lemma"]["padaStart"]) {
                            return a[0]["lemma"]["padaStart"].localeCompare(b[0]["lemma"]["padaStart"]);
                        };
                        if (a[0]["lemma"]["stanzaEnd"] !== b[0]["lemma"]["stanzaEnd"]) {
                            return a[0]["lemma"]["stanzaEnd"] - b[0]["lemma"]["stanzaEnd"];
                        };
                        return a[0]["lemma"]["padaEnd"].localeCompare(b[0]["lemma"]["padaEnd"]);
                    }
                    apparatus.sort(compare);

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
                            editionLanguage: editionLanguage,
                            editors: editors,
                            secondaryEditors: secondaryEditors,
                            contributors: contributors,
                            file: file,
                            chapter: chapter,
                            translation: translation,
                            langTranslation: translation_lang,
                            commentary: commentary,
                            parallels: parallels,
                            citations: citations,
                            notes: notes,
                            language: language,
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
                            editionLanguage: editionLanguage,
                            editors: editors,
                            secondaryEditors: secondaryEditors,
                            contributors: contributors,
                            file: false,
                            chapter: chapter,
                            translation: translation,
                            langTranslation: translation_lang,
                            commentary: commentary,
                            parallels: parallels,
                            citations: citations,
                            notes: notes,
                            language: language,
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