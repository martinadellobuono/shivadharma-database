const express = require("express");
const bodyParser = require("body-parser");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

router.get("/addMetadata/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    const session = driver.session();
    try {
        const data = await session.readTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition), (editor:Editor), (work:Work)-[r:HAS_MANIFESTATION]->(edition:Edition), (work:Work)-[w:WRITTEN_BY]->(author:Author) 
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor} 
                RETURN work.title, edition.title, author.name, editor.name
                `
            )                
        );
        const work = data.records[0]["_fields"][0];
        const title = data.records[0]["_fields"][1];
        const author = data.records[0]["_fields"][2];
        const editor = data.records[0]["_fields"][3];
        res.render("addMetadata", {
            id: req.params.id,
            work: work,
            title: title,
            author: author,
            editor: editor
        });
    } catch (err) {
        console.log("Error related to Neo4j: " + err);
    } finally {
        await session.close();
    };
});

router.post("/addMetadata/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    const session = driver.session();
    try {
        const data = await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)-[e:EDITED_BY]->(editor:Editor), (work:Work)-[r:HAS_MANIFESTATION]->(edition:Edition), (work:Work)-[w:WRITTEN_BY]->(author:Author) 
                WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor} 
                SET work.title = "${req.body.work}", edition.title = "${req.body.title}", author.name = "${req.body.author}", editor.name = "${req.body.editor}" 
                MERGE (date:Date {on: $date})
                MERGE (edition)-[p:PUBLISHED_ON]->(date)
                RETURN work.title, edition.title, editor.name, author.name, date.on
                `, 
                {date: req.body.date}
            )              
        );
        const work = data.records[0]["_fields"][0];
        const title = data.records[0]["_fields"][1];
        const author = data.records[0]["_fields"][2];
        const editor = data.records[0]["_fields"][3];
        const date = data.records[0]["_fields"][4];
        res.render("addAnnotations", {
            id: req.params.id,
            work: work,
            title: title,
            author: author,
            editor: editor,
            date: date
        });
    } catch (err) {
        console.log("Error related to Neo4j: " + err);
    } finally {
        await session.close();
    };
});

module.exports = router;