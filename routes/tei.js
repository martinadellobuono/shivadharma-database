const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
const { JSDOM } = require("jsdom");
const xmlJs = require("xml-js");

/* edition data function */
const getEditionJSON = require('./editionData');

router.get(process.env.URL_PATH + "/tei/:id", (req, res) => {

    /* edition data */
    const editionJSON = getEditionJSON();

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

        /* parse html */
        const dom = new JSDOM(data);
        const document = dom.window.document;

        /* get paragraphs */
        const paragraphs = Array.from(document.querySelectorAll("body > p")).map(p => p.textContent);

        /* build tei */
        const teiDocument = {
            declaration: {
                attributes: {
                    version: "1.0",
                    encoding: "UTF-8",
                },
            },
            elements: [
                {
                    type: "element",
                    name: "TEI",
                    elements: [
                        {
                            type: "element",
                            name: "teiHeader",
                            elements: [
                                {
                                    type: "element",
                                    name: "fileDesc",
                                    elements: [
                                        {
                                            type: "element",
                                            name: "titleStmt",
                                            elements: [
                                                {
                                                    type: "element",
                                                    name: "title",
                                                    elements: [
                                                        {
                                                            type: "text",
                                                            text: "...",
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            type: "element",
                            name: "text",
                            elements: [
                                {
                                    type: "element",
                                    name: "body",
                                    elements: paragraphs.map(text => ({
                                        type: "element",
                                        name: "p",
                                        elements: [
                                            {
                                                type: "text",
                                                text: text,
                                            },
                                        ],
                                    })),
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        /* tei to xml conversion */
        const xmlString = xmlJs.js2xml(teiDocument, { compact: false, spaces: 2 });

        /* send the file */
        res.type("application/xml").send(xmlString);
    });
});

module.exports = router;