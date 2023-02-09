const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const passport = require("passport");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.get("/account", async (req, res) => {
    
    /* store the current url in a cookie */
    /* console.log("ACCOUNT:");
    console.log(req.cookies);
    res.cookie("testURL", req.originalUrl, { overwrite: true }); */

    /* user */
    const user = req.user.name;

    /* editions */
    var editions = [];
    var idEditor;

    const session = driver.session();
    try {
        const data = await session.readTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)-[e:EDITED_BY]->(editor:Editor)
                WHERE editor.name = "${user}"
                RETURN edition.title, id(edition), id(editor)
                ORDER BY edition.title
                `
            )
            .subscribe({
                onNext: record => {
                    /* editions */
                    if (!editions.includes(record.get("edition.title") + "___" + record.get("id(edition)"))) {
                        editions.push(record.get("edition.title") + "___" + record.get("id(edition)"));
                    };
                    /* editor id */
                    idEditor = record.get("id(editor)");
                }
            })
        );
    } catch (err) {
        console.log("Error related to the upload of the editions: " + err);
    } finally {
        /* session */
        await session.close();

        /* account */
        res.render("account", {
            prevUrl: req.cookies["testURL2"],
            idEditor: idEditor,
            editions: editions,
            name: req.user.name,
            email: req.user.email
        });
    };
});

module.exports = router;