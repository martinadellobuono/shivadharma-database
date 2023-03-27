const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get(process.env.URL_PATH + "/editions", async (req, res) => {

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

    /* editions */
    var edition = [];
    var titles = [];
    var editors = [];
    var publish = [];
    var file = [];

    const session = driver.session();
    var data;
    try {
        try {
            data = await session.readTransaction(tx => tx
                .run(
                    `
                    MATCH ae = (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)
                    MATCH ee = (editor:Editor)-[:IS_EDITOR_OF]->(edition)
                    MATCH fe = (file:File)-[:IS_ITEM_OF]->(edition)
                    RETURN ae, ee, fe
                    `
                )
                .subscribe({
                    onNext: record => {
                        var title = record.get("ae")["end"]["properties"]["title"];
                        /* var publishType = record.get("ae")["end"]["properties"]["publishType"]; */
                        var authors = record.get("ae")["start"]["properties"]["name"].replace(" ; ", "---");

                        /* titles */
                        if (!titles.includes(title)) {
                            titles.push(title);
                        };

                        /* authors */
                        if (!edition.includes(title + "___" + authors)) {
                            edition.push(title + "___" + authors);
                        };

                        titles.forEach((title) => {
                            /* editors */
                            if (title == record.get("ee")["end"]["properties"]["title"]) {
                                if (!editors.includes(title + "___" + record.get("ee")["start"]["properties"]["name"] + "---" + record.get("ee")["start"]["properties"]["email"])) {
                                    editors.push(title + "___" + record.get("ee")["start"]["properties"]["name"] + "---" + record.get("ee")["start"]["properties"]["email"]);
                                };

                                /* publish type */
                                if (!publish.includes(title + "___" + record.get("ee")["end"]["properties"]["publishType"])) {
                                    publish.push(title + "___" + record.get("ee")["end"]["properties"]["publishType"]);
                                };
                            };

                            /* file */
                            if (title == record.get("fe")["end"]["properties"]["title"]) {
                                if (!file.includes(title + "___" + record.get("fe")["start"]["properties"]["name"])) {
                                    file.push(title + "___" + record.get("fe")["start"]["properties"]["name"]);
                                };
                            };
                        });
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

        /* one array containing titles, authors, editors, file */
        var edTitles = [];
        var edDict = [];

        editors.forEach((editor) => {
            var title = editor.split("___")[0];
            if (!edTitles.includes(title)) {
                edTitles.push(title);
            };
        });

        edTitles.forEach((title) => {

            /* authors */
            var edAuthors = [];
            /* array of authors according to title */
            edition.forEach((author) => {
                if (author.indexOf(title) > -1) {
                    edAuthors.push(author.split("___")[1]);
                };
            });

            /* editors */
            var edEditors = [];
            /* array of editors according to title */
            editors.forEach((editor) => {
                if (editor.indexOf(title) > -1) {
                    edEditors.push(editor.split("___")[1]);
                };
            });

            /* publish type */
            var edPublish = [];
            /* array of editors according to title */
            publish.forEach((el) => {
                if (el.indexOf(title) > -1) {
                    edPublish.push(el.split("___")[1]);
                };
            });

            /* file */
            var edFile = [];
            /* array of file according to title */
            file.forEach((el) => {
                if (el.indexOf(title) > -1) {
                    edFile.push(el.split("___")[1]);
                };
            });

            /* dict title editors */
            var editorsDict = JSON.stringify({
                [title]: {
                    publishType: edPublish.join(""),
                    authors: edAuthors,
                    editors: edEditors,
                    file: edFile.join("").split(".html")[0]
                }
            });

            /* array of all the dictionaries */
            if (!edDict.includes(editorsDict)) {
                edDict.push(editorsDict);
            };

        });

        /* sort alphabetically the editions */
        edDict.sort();

        /* page rendering */
        res.render("editions", {
            prevUrl: prevUrl,
            editions: edDict,
            name: req.user.name,
            email: req.user.email
        });
    };
});

module.exports = router;