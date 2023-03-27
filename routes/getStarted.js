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
    /* edition url */
    var idEdition;
    var idEditor;

    /* current user */
    var currentUser = req.user.name;

    /* users email */
    var userEmails = [];

    /* other editors array */
    var otherEditorsArr = [];
    var otherEditors = req.body.otherEditors;
    otherEditors.split(" ; ").forEach(otherEditor => {
        if (otherEditor !== "" || otherEditor !== undefined) {
            if (!otherEditorsArr.includes(otherEditor)) {
                otherEditorsArr.push(otherEditor);
            };
        };
    });

    /* contributors array */
    var contributorsArr = [];
    var contributors = req.body.contributors;
    contributors.split(" ; ").forEach(contributor => {
        if (contributor !== "" || contributor !== undefined) {
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
                MATCH editors = (users:Editor)
                MERGE (work:Work {title: "${req.body.work}"})
                MERGE (edition:Edition {title: "${req.body.title}", editionOf: "${req.body.editionOf}", authorCommentary: "${req.body.authorCommentary}"})
                MERGE (author:Author {name: "${req.body.author}"})
                MERGE (editor:Editor {name: "${req.body.editor}"})
                MERGE (work)-[:HAS_MANIFESTATION]->(edition)
                MERGE (work)-[:WRITTEN_BY]->(author)
                MERGE (editor)-[:IS_EDITOR_OF]->(edition)
                ON CREATE SET edition.publishType = "Save as draft"

                FOREACH (email IN split("${otherEditorsArr}", ",") |
                    MERGE otherEditor = (editor:Editor {email: email})
                    ON MATCH SET editor.email = email
                    MERGE (editor)-[:IS_EDITOR_OF]->(edition)
                )

                FOREACH (email IN split("${contributorsArr}", ",") |
                    MERGE contributor = (editor:Editor {email: email})
                    ON MATCH SET editor.email = email
                    MERGE (editor)-[:IS_CONTRIBUTOR_OF]->(edition)
                )

                

                RETURN editors, ID(edition), ID(editor)
                `
            )
            .subscribe({
                onNext: record => {
                    /* email of all the users */
                    if (!userEmails.includes(record.get("editors")["end"]["properties"]["email"])) {
                        if (record.get("editors")["end"]["properties"]["email"] !== undefined) {
                            userEmails.push(record.get("editors")["end"]["properties"]["email"]);
                        };
                    };

                    /* id for url of the edition */
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

        /* check if the inserted editors' mails exists */
        var notExistingUsers = [];
        otherEditorsArr.forEach((email) => {
            if (!userEmails.includes(email)) {
                if (!notExistingUsers.includes(email)) {
                    notExistingUsers.push(email);
                };
            };
        });

        /* empty the array if it contains only an empty value */
        if (notExistingUsers.length = 1 && notExistingUsers.includes("")) {
            notExistingUsers = [];
        };

        /* page redirect */
        if (notExistingUsers.length > 0) {
            /* the mails do not exist */
            res.render("getStarted", {
                name: currentUser,
                errorMessage: "The editor's mails " + notExistingUsers.join(", ") + " do not exist."
            });
        } else {
            /* the mails exist */
            res.redirect(process.env.URL_PATH + "/edit/" + idEdition + "-" + idEditor);
        };
    };
}
);

module.exports = router;