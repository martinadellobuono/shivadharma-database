const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get(process.env.URL_PATH + "/getstarted", async (req, res) => {
    res.render("getstarted", { name: req.user.name });
});

router.post(process.env.URL_PATH + "/getstarted", async (req, res) => {
    var idEdition;
    var idEditor;

    /* other editors array */
    var otherEditorsArr = [];
    var otherEditors = req.body.otherEditors;
    otherEditors.split(" ; ").forEach(otherEditor => {
        if (otherEditor !== "") {
            if (!otherEditorsArr.includes(otherEditor)) {
                otherEditorsArr.push(otherEditor);
            };
        };
    });

    /* contributors array */
    var contributorsArr = [];
    var contributors = req.body.contributors;
    contributors.split(" ; ").forEach(contributor => {
        if (contributor !== "") {
            if (!contributorsArr.includes(contributor)) {
                contributorsArr.push(contributor);
            };
        };
    });

    const session = driver.session();
    try {
        await session.writeTransaction(tx => tx
            .run(
                `
                MERGE (work:Work {title: "${req.body.work}"})
                MERGE (edition:Edition {title: "${req.body.title}", editionOf: "${req.body.editionOf}", authorCommentary: "${req.body.authorCommentary}"})
                MERGE (author:Author {name: "${req.body.author}"})
                MERGE (editor:Editor {name: "${req.body.editor}"})
                MERGE (work)-[:HAS_MANIFESTATION]->(edition)
                MERGE (work)-[:WRITTEN_BY]->(author)
                MERGE (editor)-[:IS_EDITOR_OF]->(edition)
                ON CREATE SET edition.publishType = "Save as draft"

                FOREACH (name IN split("${otherEditorsArr}", ",") |
                    MERGE otherEditor = (editor:Editor {name: name})
                    MERGE (editor)-[:IS_EDITOR_OF]->(edition)
                )
                
                FOREACH (name IN split("${contributorsArr}", ",") |
                    MERGE contributor = (editor:Editor {name: name})
                    MERGE (editor)-[:IS_CONTRIBUTOR_OF]->(edition)
                )
                
                RETURN ID(edition), ID(editor)
                `
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