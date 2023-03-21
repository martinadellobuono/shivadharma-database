const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post(process.env.URL_PATH + "/addPhilologicalNote/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    var path = `${__dirname}/../../../uploads/philologicalNote/note-${idEdition}-${idEditor}.html`;
    try {
        fs.writeFile(path, req.body.philologicalNote, "utf8", (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("The philological note has been overwritten");
            };
        });
    } catch (error) {
        console.log(error);
    } finally {
        /* put in the database and visualize it in the editor */
        var philologicalNote = `note-${idEdition}-${idEditor}.html`
        const session = driver.session();
        try {
            try {
                await session.writeTransaction(tx => tx
                    .run(
                        `
                            MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                            WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                            MERGE (philologicalNote:PhilologicalNote {name: $philologicalNote})
                            MERGE (philologicalNote)-[:PRODUCED_BY]->(editor)
                            MERGE (philologicalNote)<-[:IS_DOCUMENTED_IN]-(edition)
                            RETURN *
                            `, { philologicalNote: philologicalNote }
                    )
                    .subscribe({
                        onCompleted: () => {
                            console.log("Philological note added to the database");
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
        } catch (err) {
            console.log(err);
        } finally {
            res.redirect(process.env.URL_PATH + "/edit/" + idEdition + "-" + idEditor);
        };
    };
});

module.exports = router;