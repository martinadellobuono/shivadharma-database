const express = require("express");
const path = require("path");
const formidable = require("formidable");
const bodyParser = require("body-parser");
const fs = require("fs");
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.post("/saveFile", async (req, res) => { 
    var idEdition = req.body.idEdition;
    var idEditor = req.body.idEditor;
    var content = req.body.content;
    var path = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;
    if (content !== undefined) { /* it avoids errors when uploading a new file */
        try {
            fs.access(path, fs.F_OK, () => {
                fs.writeFile(path, content, "utf8", (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("The file has been overwritten");
                    };
                });
            });
        } catch (error) {
            console.log(error);
        };
    };
});

module.exports = router;