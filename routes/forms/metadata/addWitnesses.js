const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.post("/addWitnesses/:id", async (req, res) => {
    const idEdition = req.params.id.split("/").pop().split("-")[0];
    const idEditor = req.params.id.split("/").pop().split("-")[1];
    
    var i = 0;

    var siglum;
    var provenance;
    var location;
    var repository;
    var classmark;
    var antigraph;
    var author;
    var title;
    var notes;
    var language;
    var scripts;
    var structuralTypology;
    var state;
    var condition;
    var format;
    var material;
    var dimensions;
    var extent;
    var binding;
    var date;
    var foliation;
    var people;
    var marginalia;
    var initialRubric;
    var incipit;
    var explicit;
    var finalRubric;
    var colophon;
    var bibliography;
    var editions;
    var secondaryLiterature;
    var authorRecord;
    var siglumTex;
    var notes;

    let keys = Object.keys(req.body);
    var wits = [];
    keys.forEach((el) => {
        if (el.indexOf("witnessSiglumSuperscript") > -1) {
            if (!wits.includes(el)) {
                wits.push(el);
            };
        };
    });

    const session = driver.session();
    try {
        await session.writeTransaction((tx) => {
            wits.forEach(() => {
                base = "witnessSiglumBase" + i;
                superscript = "witnessSiglumSuperscript" + i;
                subscript = "witnessSiglumSubscript" + i;
                provenance = "witnessProvenance" + i;
                location = "witnessLocation" + i;
                repository = "witnessRepository" + i;
                classmark = "witnessClassmark" + i;
                antigraph = "witnessAntigraph" + i;
                author = "witnessAuthor" + i;
                title = "witnessTitle" + i;
                language = "witnessLanguage" + i;
                scripts = "witnessScripts" + i;
                structuralTypology = "witnessStructuralTypology" + i;
                state = "witnessState" + i;
                condition = "witnessCondition" + i;
                format = "witnessFormat" + i;
                material = "witnessMaterial" + i;
                dimensionsW = "witnessDimensionsW" + i;
                dimensionsH = "witnessDimensionsH" + i;
                extent = "witnessExtent" + i;
                binding = "witnessBinding" + i;
                foliation = "witnessFoliation" + i;
                date = "witnessDate" + i;
                people = "witnessPeople" + i;
                marginalia = "witnessMarginalia" + i;
                initialRubric = "witnessInitialRubric" + i;
                incipit = "witnessIncipit" + i;
                explicit = "witnessExplicit" + i;
                finalRubric = "witnessFinalRubric" + i;
                colophon = "witnessColophon" + i;
                bibliography = "witnessBibliography" + i;
                editions = "witnessEditions" + i;
                secondaryLiterature = "witnessSecondaryLiterature" + i;
                authorRecord = "witnessAuthorRecord" + i;
                siglumTex = "witnessSiglumTex" + i;
                notes = "witnessNotes" + i;

                tx.run(
                    `
                    MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)-[:EDITED_BY]->(editor:Editor)  
                    WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                    OPTIONAL MATCH (edition)-[:PUBLISHED_ON]->(date:Date)
                    MERGE (witness:Witness {
                        siglum: "${req.body[base]}" + "<sup>" + "${req.body[superscript]}" + "</sup><sub>" + "${req.body[subscript]}" + "</sub>",
                        provenance: "${req.body[provenance]}",
                        location: "${req.body[location]}",
                        repository: "${req.body[repository]}",
                        classmark: "${req.body[classmark]}",
                        antigraph: "${req.body[antigraph]}",
                        author: "${req.body[author]}",
                        title: "${req.body[title]}",
                        language: "${req.body[language]}",
                        scripts: "${req.body[scripts]}",
                        structuralTypology: "${req.body[structuralTypology]}",
                        state: "${req.body[state]}",
                        condition: "${req.body[condition]}",
                        format: "${req.body[format]}",
                        material: "${req.body[material]}",
                        dimensionsW: "${req.body[dimensionsW]}",
                        dimensionsH: "${req.body[dimensionsH]}",
                        extent: "${req.body[extent]}",
                        binding: "${req.body[binding]}",
                        foliation: "${req.body[foliation]}",
                        date: "${req.body[date]}",
                        people: "${req.body[people]}",
                        marginalia: "${req.body[marginalia]}",
                        initialRubric: "${req.body[initialRubric]}",
                        incipit: "${req.body[incipit]}",
                        explicit: "${req.body[explicit]}",
                        finalRubric: "${req.body[finalRubric]}",
                        colophon: "${req.body[colophon]}",
                        bibliography: "${req.body[bibliography]}",
                        editions: "${req.body[editions]}",
                        secondaryLiterature: "${req.body[secondaryLiterature]}",
                        authorRecord: "${req.body[authorRecord]}",
                        siglumTex: "${req.body[siglumTex]}",
                        notes: "${req.body[notes]}"
                    })
                    MERGE (edition)<-[:USED_IN]-(witness)
                    RETURN *
                    `
                )
                    .subscribe({
                        onCompleted: () => {
                            console.log("Data added to the database")
                        },
                        onError: err => {
                            console.log(err)
                        }
                    })
                i++;
            });
        });
    } catch (err) {
        console.log(err);
    } finally {
        res.redirect(`../edit/${idEdition}-${idEditor}`);
        await session.close();
    };
});

module.exports = router;