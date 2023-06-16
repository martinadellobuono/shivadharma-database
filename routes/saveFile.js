/*
    File saveFile.js
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
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();

router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.post(process.env.URL_PATH + "/saveFile", async (req, res) => {
    var idEdition = req.body.idEdition;
    var idEditor = req.body.idEditor;
    var contentFile = req.body.contentFile;
    var path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;

    if (contentFile !== undefined) { /* it avoids errors when uploading a new file */
        try {
            /* SAVE THE FILE */
            fs.access(path, fs.F_OK, () => {
                fs.writeFile(path, contentFile, "utf8", (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("The file has been overwritten");
                    };
                });
            });
        } catch (error) {
            console.log(error);
        } finally {
            /* SEND THE NEW FRAGMENT TO THE DATABASE IF EXISTS */
            const session = driver.session();
            try {
                var idFragment = req.body.idFragment;
                var contentFragment = req.body.contentFragment;
                if (idFragment !== undefined) {
                    await session.writeTransaction(tx => tx
                        .run(
                            `
                            MATCH (edition:Edition)<-[:IS_EDITOR_OF]-(editor:Editor)
                            WHERE id(edition) = ${idEdition} AND id(editor) = ${idEditor}
                            MERGE (selectedFragment:SelectedFragment {idAnnotation: "${idFragment}"})
                            ON CREATE
                                SET selectedFragment.value = "${contentFragment}"
                            ON MATCH
                                SET selectedFragment.value = "${contentFragment}"
                            RETURN *
                            `
                        )
                        .subscribe({
                            onCompleted: () => {
                                console.log("Annotated fragment updated.");
                            },
                            onError: err => {
                                console.log(err)
                            }
                        })
                    );
                };
            } catch (err) {
                console.log(err);
            } finally {
                await session.close();
            };

            /* send res */
            res.json(contentFile);
        };
    };
});

module.exports = router;