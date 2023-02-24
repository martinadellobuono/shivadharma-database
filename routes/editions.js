const express = require("express");
const bodyParser = require("body-parser");

const passport = require("passport");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/editions", async (req, res) => {

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
    const session = driver.session();
    var data;

    try {
        try {
            data = await session.readTransaction(tx => tx
                .run(
                    `
                    MATCH (author:Author)<-[w:WRITTEN_BY]-(work:Work)-[h:HAS_MANIFESTATION]->(edition:Edition)-[e:EDITED_BY]->(editor:Editor)
                    RETURN author.name, edition.title, editor.name, ID(edition), ID(editor), editor.email
                    ORDER BY edition.title, author.name, editor.name
                    `
                )
            );
        } catch (err) {
            console.log(err);
        } finally {
            await session.close();
        };
    } catch (err) {
        console.log(err);
    } finally {
        res.render("editions", {
            prevUrl: prevUrl,
            editions: data.records.map(row => {
                return row;
            }),
            name: req.user.name,
            email: req.user.email
        });
    };
});

module.exports = router;