const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get(process.env.URL_PATH + "/txt/:id", (req, res) => {

    /* url of the current page */
    const idEdition = req.params.id.split("/").pop().split("-")[0];
    const idEditor = req.params.id.split("/").pop().split("-")[1];

    /* file */
    var filePath = `${__dirname}/../uploads/${idEdition}-${idEditor}.html`;

    /* read the file */
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error(err);
            return;
        };

        /* remove html tags */
        const plainText = stripHtml(data);

        /* create a txt file */
        const txtFilePath = path.join(__dirname, "..", "txt", `${idEdition}-${idEditor}.txt`);
        fs.writeFile(txtFilePath, plainText, "utf8", (err) => {
            if (err) {
                console.error('Errore nella scrittura del file:', err);
                res.status(500).send('Errore nella scrittura del file');
                return;
            };

            /* set Content-Disposition header to decode escaped characters */
            res.setHeader('Content-Disposition', `attachment; filename="${idEdition}-${idEditor}.txt"`);

            /* download the txt file as response */
            res.download(txtFilePath, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    /* delete the file after download */
                    fs.unlink(txtFilePath, (err) => {
                        if (err) {
                            console.error(err);
                        };
                    });
                };
            });
        });
    });
});

/* remove html */
function stripHtml(html) {
    html = html.replace(/&ntilde;/g, "ñ");
    return html.replace(/<([^>]+)>/g, (match, tag) => {
        if (tag === "p" || tag === "/p") {
            return "\n";
        } else {
            return "";
        };
    });
};

module.exports = router;