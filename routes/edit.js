const express = require("express");
const bodyParser = require("body-parser");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/edit/:id", async (req, res) => {
    const idEdition = req.params.id.split("/").pop().split("-")[0];
    const idEditor = req.params.id.split("/").pop().split("-")[1];
    const session = driver.session();
    try {
        await session.readTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)-[e:EDITED_BY]->(editor:Editor), (work:Work)-[r:HAS_MANIFESTATION]->(edition), (work)-[w:WRITTEN_BY]->(author:Author) 
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                OPTIONAL MATCH (edition)-[p:PUBLISHED_ON]->(date:Date)
                RETURN work.title, edition.title, author.name, editor.name, date.on
                `
            )
            .subscribe({
                onNext: record => {
                    res.render("edit", {
                        id: req.params.id,
                        work: record.get("work.title"),
                        title: record.get("edition.title"),
                        author: record.get("author.name"),
                        editor: record.get("editor.name"),
                        date: record.get("date.on")
                    });
                },
                onCompleted: () => {
                    console.log("Data added to the graph");
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
                


                MERGE (edition)-[p:PUBLISHED_ON]->(date:Date)
                ON CREATE
                    SET edition.title = "${req.body.title}", date.on = "${req.body.date}", editor.name = "${req.body.editor}", work.title = "${req.body.work}", author.name = "${req.body.author}"
                ON MATCH 
                    SET edition.title = "${req.body.title}", date.on = "${req.body.date}", editor.name = "${req.body.editor}", work.title = "${req.body.work}", author.name = "${req.body.author}"
                
                
                RETURN edition.title, date.on, editor.name, work.title, author.name, file.name
                
                `
            )
            .subscribe({
                onNext: record => {
                    res.render("edit", {
                        id: req.params.id,
                        work: record.get("work.title"),
                        title: record.get("edition.title"),
                        author: record.get("author.name"),
                        editor: record.get("editor.name"),
                        date: record.get("date.on"),
                        file: record.get("file.name")
                    });
                },
                onCompleted: () => {
                    console.log("Data added to the graph");
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