const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get(process.env.URL_PATH + "/getstarted", async (req, res) => {
    res.render("getstarted", { name: req.user.name });
});

router.post(process.env.URL_PATH + "/getstarted", async (req, res) => {
    var idEdition;
    var idEditor;
    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                    MERGE (work:Work {title: $work})
                    MERGE (edition:Edition {title: $title, editionOf: $editionOf, authorCommentary: $authorCommentary})
                    MERGE (author:Author {name: $author})
                    MERGE (editor:Editor {name: $editor})
                    MERGE (work)-[:HAS_MANIFESTATION]->(edition)
                    MERGE (work)-[:WRITTEN_BY]->(author)
                    MERGE (edition)-[:EDITED_BY]->(editor)
                    ON CREATE
                        SET edition.publishType = "Save as draft"
                    RETURN work.title, ID(edition), edition.title, author.name, ID(editor), editor.name
                    `,
                {
                    work: req.body.work,
                    title: req.body.title,
                    author: req.body.author,
                    editor: req.body.editor,
                    editionOf: req.body.editionOf,
                    authorCommentary: req.body.authorCommentary
                }
            )
            .subscribe({
                onNext: record => {
                    idEdition = record.get("ID(edition)");
                    idEditor = record.get("ID(editor)");
                },
                onCompleted: () => {
                    console.log("Data added to the graph");
                },
                onError: err => {
                    console.log(err);
                }
            })
        );
    } catch (err) {
        console.log(err);
    } finally {
        /* close session */
        await session.close();

        /* page redirect */
        res.redirect(process.env.URL_PATH + "/edit/" + idEdition + "-" + idEditor);
    };
}
);

module.exports = router;