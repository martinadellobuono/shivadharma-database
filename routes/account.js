const express = require("express");
const bodyParser = require("body-parser");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.get(process.env.URL_PATH + "/account", async (req, res) => {
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

    /* db session */
    const session = driver.session();

    try {
        try {
            /* extract data from db */
            await session.readTransaction(tx => tx
                .run(
                    `
                    MATCH (edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                    WHERE editor.name = "${user}"
                    RETURN edition.publishType, edition.title, id(edition), id(editor)
                    ORDER BY edition.title
                    `
                )
                .subscribe({
                    onNext: record => {
                        /* editions */
                        if (!editions.includes(record.get("edition.title") + "___" + record.get("id(edition)") + "---" + record.get("edition.publishType"))) {
                            editions.push(record.get("edition.title") + "___" + record.get("id(edition)") + "---" + record.get("edition.publishType"));
                        };
                        /* editor id */
                        idEditor = record.get("id(editor)");
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
        /* render the page */
        res.render("account", {
            prevUrl: prevUrl,
            idEditor: idEditor,
            editions: editions,
            name: req.user.name,
            email: req.user.email
        });
    };
});

router.post(process.env.URL_PATH + "/modifyAccount", async (req, res) => {
    try {
        /* account data */
        const oldName = req.user.name;
        const oldEmail = req.user.email;
        const newName = req.body.newName;
        const newEmail = req.body.newEmail;
        
        /* editions */
        var editions = [];
        var idEditor;

        /* db session */
        const session = driver.session();

        /* post new account data */
        await session.writeTransaction(tx => tx
            .run(
                `
                MATCH (edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                WHERE editor.name = "${oldName}" AND editor.email = "${oldEmail}"
                MERGE (edition)<-[:IS_EDITOR_OF]-(editor)
                ON CREATE
                    SET editor.name = "${newName}", editor.email = "${newEmail}"
                ON MATCH 
                    SET editor.name = "${newName}", editor.email = "${newEmail}"
                RETURN edition.publishType, edition.title, id(edition), id(editor), editor.name, editor.email
                `
            )
            .subscribe({
                onNext: record => {
                    /* editions */
                    if (!editions.includes(record.get("edition.title") + "___" + record.get("id(edition)") + "---" + record.get("edition.publishType"))) {
                        editions.push(record.get("edition.title") + "___" + record.get("id(edition)") + "---" + record.get("edition.publishType"));
                    };
                    /* editor id */
                    idEditor = record.get("id(editor)");
                },
                onCompleted: () => {
                    console.log("Updated account");
                },
                onError: err => {
                    console.log(err);
                }
            })
        );

    } catch (err) {
        console.log(err);
    } finally {
        /* render the page */
        res.render("account", {
            idEditor: idEditor,
            editions: editions,
            name: req.body.newName,
            email: req.body.newEmail
        });
    };
});

module.exports = router;