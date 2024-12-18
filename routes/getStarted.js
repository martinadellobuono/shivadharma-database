/*
    File getStarted.js
    Author: Martina Dello Buono
    Author's address: martinadellobuono1@gmail.com
    Copyright (c) 2023 by the author
    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.
    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
    SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
    OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
    CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get(process.env.URL_PATH + "/getStarted", async (req, res) => {
    res.render("getStarted", { name: req.user.name });
});

router.post(process.env.URL_PATH + "/getStarted", async (req, res) => {
    /* edition url */
    var idEdition;
    var idEditor;

    /* current user */
    var currentUser = req.user.name;

    /* users email */
    var userEmails = [];
    var notExistingUsers = [];

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
                MATCH (users:Editor)
                RETURN users.email
                `
            )
            .subscribe({
                onNext: record => {
                    var user = record.get("users.email");

                    /* all users array */
                    if (!userEmails.includes(user)) {
                        userEmails.push(user);
                    };

                },
                onCompleted: () => {

                    /* check if the editors inserted are users yet */
                    otherEditorsArr.concat(contributorsArr).forEach((user) => {
                        if (user !== "") {
                            if (!userEmails.includes(user)) {
                                /* array of not existing users */
                                if (!notExistingUsers.includes(user)) {
                                    notExistingUsers.push(user);
                                };
                            };
                        };
                    });

                },
                onError: err => {
                    console.log(err);
                }
            })
        );
    } catch (err) {
        console.log(err);
    } finally {

        /* all the mails inserted exist */
        if (notExistingUsers >= 0) {

            /* id edition / id editor */
            var idEdition;
            var idEditor;

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
                        MERGE (language:Language {name: "${req.body.editionLanguage}"})
                        MERGE (edition)-[:WRITTEN_IN]->(language)
                        ON CREATE SET edition.publishType = "Save as draft"

                        FOREACH (email IN split("${otherEditorsArr}", ",") | 
                            FOREACH (ignoreMe IN CASE WHEN email <> "" THEN [1] ELSE [] END | 
                                MERGE (otherEditor:Editor {email: email})
                                ON CREATE SET otherEditor.email = email
                                MERGE (otherEditor)-[:IS_SECONDARY_EDITOR_OF]->(edition)
                            )
                        )

                        FOREACH (email IN split("${contributorsArr}", ",") |
                            FOREACH (ignoreMe IN CASE WHEN email <> "" THEN [1] ELSE [] END | 
                                MERGE otherContributor = (editor:Editor {email: email})
                                ON CREATE SET editor.email = email
                                MERGE (editor)-[:IS_CONTRIBUTOR_OF]->(edition)
                            )
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
                            console.log("Work, edition, authors, editor, and publish type added to the graph");
                        },
                        onError: err => {
                            console.log(err);
                        }
                    })
                );
            } catch (err) {
                console.log(err);
            } finally {
                /* the mails exist */
                /* redirect to the edit page */
                res.redirect(process.env.URL_PATH + "/edit/" + idEdition + "-" + idEditor);
            };

        } else {
            /* at least one mail do not exist */
            res.render("getStarted", {
                name: currentUser,
                errorMessage: "The users " + notExistingUsers.join(", ") + " do not exist."
            });

            /* close session */
            session.close();
        };

    };
}
);

module.exports = router;