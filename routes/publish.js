const express = require("express");
const path = require("path");
const formidable = require("formidable");
const bodyParser = require("body-parser");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.post("/publish/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    var path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;
    try {
        fs.access(path, fs.F_OK, () => {
            fs.writeFile(path, req.body.fileBaseTxt, "utf8", (err) => {
                if (err) {
                    console.log("Error related to rewriting the file: " + err);
                } else {
                    console.log("The file has been overwritten");
                };
            });
        });
    } catch (error) {
        console.log(error);
    } finally {
        res.redirect("../edition/" + idEdition + "-" + idEditor);
    };
});

module.exports = router;