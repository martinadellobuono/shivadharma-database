const express = require("express");
const path = require("path");
const formidable = require("formidable");
const bodyParser = require("body-parser");
const fs = require("fs");
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.post("/saveAsDraft/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    var path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;
    try {
        fs.access(path, fs.F_OK, () => {
            fs.writeFile(path, req.body.fileBaseTxt, "utf8", (err) => {
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
        res.redirect(process.env.URL_PATH + "/account");
    };
});

module.exports = router;