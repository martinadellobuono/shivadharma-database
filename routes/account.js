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
    /* previous url */
    var prevUrl;

    /* update the second url to become the previous one in the next page */
    res.cookie("test_url_1", req.cookies["test_url_2"], { overwrite: true });
    res.cookie("test_url_2", req.originalUrl, { overwrite: true });

    /* store the current url in a cookie */
    if (req.originalUrl !== req.cookies["test_url_2"]) {
        req.cookies["test_url_1"] = req.cookies["test_url_2"];
        prevUrl = req.cookies["test_url_1"];
    } else {
        const { headers: { cookie } } = req;
        if (cookie) {
            const values = cookie.split(';').reduce((res, item) => {
                const data = item.trim().split('=');
                return { ...res, [data[0]]: data[1] };
            }, {});
            res.locals.cookie = values;
        }
        else res.locals.cookie = {};

        prevUrl = res.locals.cookie["test_url_1"].replace(/%2F/g, "/");
    };

    /* user */
    const user = req.user.name;

    /* editions */
    var editions = [];
    var idEditor;

    const session = driver.session();

    try {
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
            await session.close();
        };
    } catch (err) {
        console.log(err);
    } finally {
        res.render("account", {
            prevUrl: prevUrl,
            idEditor: idEditor,
            editions: editions,
            name: req.user.name,
            email: req.user.email
        });
    };

});

module.exports = router;