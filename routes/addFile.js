const express = require("express");
const path = require("path");
const formidable = require("formidable");
const bodyParser = require("body-parser");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post("/addFile/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    var form = formidable();
    form.parse(req);
    form.on("fileBegin", (name, file) => {
        file.path = `${__dirname}/../uploads/${file.name}`;
    });
    form.on("file", async (name, file) => {
        const session = driver.session();
        try {
            await session.writeTransaction(tx => tx
                .run(
                    `
                    MATCH (edition:Edition)-[e:EDITED_BY]->(editor:Editor), (work:Work)-[r:HAS_MANIFESTATION]->(edition), (work)-[w:WRITTEN_BY]->(author:Author)
                    WHERE id(editor) = ${idEditor} AND id(editor) = ${idEditor}
                    OPTIONAL MATCH (edition)-[p:PUBLISHED_ON]->(date:Date)
                    MERGE (file:File {name: $file})
                    MERGE (file)-[pr:PRODUCED_BY]->(editor)
                    RETURN work.title, edition.title, author.name, editor.name, date.on, file.name
                    `, { file: file.name })
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
    form.on("error", (err) => {
        console.log(err);
    })
    form.on("end", () => {
        console.log("File uploaded");
    });
});

module.exports = router;