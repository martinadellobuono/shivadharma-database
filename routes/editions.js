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
    /* editions data */
    var titles = [];
    /* / */

    const session = driver.session();
    var data;

    try {
        try {
            data = await session.readTransaction(tx => tx
                .run(
                    `
                    MATCH (author:Author)<-[:WRITTEN_BY]-(work:Work)-[:HAS_MANIFESTATION]->(edition:Edition)
                    MATCH (edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                    RETURN author.name, edition.title, editors
                    `
                )
                .subscribe({
                    onNext: record => {

                        /* titles */
                        if (!titles.includes(record.get("edition.title"))) {
                            titles.push(record.get("edition.title"));
                        };
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

        /* try */
        console.log(titles);
        /* / */

        res.render("editions", {
            prevUrl: prevUrl,
            editions: "",
            name: req.user.name,
            email: req.user.email
        });
    };
});

module.exports = router;