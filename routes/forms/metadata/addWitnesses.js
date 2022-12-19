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
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)-[:EDITED_BY]->(editor:Editor)  
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                OPTIONAL MATCH (edition)-[:PUBLISHED_ON]->(date:Date)
                MERGE (witness:Witness {
                    siglum: $siglum, 
                    provenance: $provenance,
                    settlement: $settlement,
                    collection: $collection,
                    classmark: $classmark,
                    antigraph: $antigraph,
                    author: $author,
                    title: $title,
                    notes: $notes,
                    language: $language,
                    scripts: $scripts,
                    structuralTypology: $structuralTypology,
                    state: $state,
                    condition: $condition,
                    format: $format,
                    material: $material,
                    dimensions: $dimensions,
                    extent: $extent,
                    binding: $binding,
                    date: $date,
                    foliation: $foliation,
                    people: $people,
                    marginalia: $marginalia,
                    initialRubric: $initialRubric,
                    incipit: $incipit,
                    explicit: $explicit,
                    finalRubric: $finalRubric,
                    colophon: $colophon,
                    bibliography: $bibliography,
                    editions: $editions,
                    secondaryLiterature: $secondaryLiterature,
                    authorRecord: $authorRecord,
                    siglumTex: $siglumTex,
                    notes: $notes
                })
                MERGE (edition)<-[:USED_IN]-(witness)
                RETURN work.title, edition.title, author.name, editor.name, witness.siglum, date.on
                `, { 
                    siglum: req.body.witnessSiglumBase + "<sup>" + req.body.witnessSiglumSuperscript + "</sup><sub>" + req.body.witnessSiglumSubscript + "</sub>",
                    provenance: req.body.witnessProvenance,
                    settlement: req.body.witnessSettlement,
                    collection: req.body.witnessCollection,
                    classmark: req.body.witnessClassmark,
                    antigraph: req.body.witnessAntigraph,
                    author: req.body.witnessAuthor,
                    title: req.body.witnessTitle,
                    notes: req.body.witnessNotes,
                    language: req.body.witnessLanguage,
                    scripts: req.body.witnessScripts,
                    structuralTypology: req.body.witnessStructuralTypology,
                    state: req.body.witnessState,
                    condition: req.body.witnessCondition,
                    format: req.body.witnessFormat,
                    material: req.body.witnessMaterial,
                    dimensions: req.body.witnessDimensions,
                    extent: req.body.witnessExtent,
                    binding: req.body.witnessBinding,
                    date: req.body.witnessDate,
                    foliation: req.body.witnessFoliation,
                    people: req.body.witnessPeople,
                    marginalia: req.body.witnessMarginalia,
                    initialRubric: req.body.witnessInitialRubric,
                    incipit: req.body.witnessIncipit,
                    explicit: req.body.witnessExplicit,
                    finalRubric: req.body.witnessFinalRubric,
                    colophon: req.body.witnessColophon,
                    bibliography: req.body.witnessBibliography,
                    editions: req.body.witnessEditions,
                    secondaryLiterature: req.body.witnessSecondaryLiterature,
                    authorRecord: req.body.witnessAuthorRecord,
                    siglumTex: req.body.witnessSiglumTex,
                    notes: req.body.witnessNotes

                }
            )
            .subscribe({
                onNext: () => {
                    res.redirect(`../edit/${idEdition}-${idEditor}`);
                },
                onCompleted: () => {
                    console.log("Data added to the database")
                },
                onError: err => {
                    console.log("Error related to Neo4j action /addWitnesses/:id: " + err)
                }
            })
        );
    } catch (err) {
        console.log("Error related to Neo4j action /addWitnesses/:id: " + err);
    } finally {
        await session.close();
    };
});

module.exports = router;