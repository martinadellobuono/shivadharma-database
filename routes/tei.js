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

        /* remove all spans with data-type="annotation-object" from the html */
        /* hidden div to upload the html */
        const div = document.createElement('div');
        div.style.display = 'none';
        div.innerHTML = data;

        /* find all the annotation-object spans */
        const annotationObjects = div.querySelectorAll('span[data-type="annotation-object"]');

        /* remove all the annotation-objects spans but their content */
        annotationObjects.forEach(span => {
            const parent = span.parentNode;
            while (span.firstChild) {
                parent.insertBefore(span.firstChild, span);
            }
            parent.removeChild(span);
        });

        /* paragraphs to replace with div */
        const paragraphs = div.querySelectorAll("p");

        paragraphs.forEach(p => {
            const divElement = document.createElement("div");
            while (p.firstChild) {
                divElement.appendChild(p.firstChild);
            }
            p.parentNode.replaceChild(divElement, p);
        });

        /* span to replace with milestone */
        const milestones = div.querySelectorAll('span[data-type="milestone"]');

        milestones.forEach(span => {
            const milestoneElement = document.createElement("milestone");
            const annotationValue = span.getAttribute("data-annotation").replace("#", "");
            milestoneElement.setAttribute("xml:id", annotationValue);
            const typeValue = span.getAttribute("data-type");
            milestoneElement.setAttribute("type", typeValue);
            span.parentNode.replaceChild(milestoneElement, span);
        });

        /* html with milestones */
        const htmlWithMilestones = div.innerHTML;

        /* html > xml */
        const { parse } = require("node-html-parser");
        const htmlRoot = parse(htmlWithMilestones);

        function htmlToXml(node) {
            const xmlElement = {
                type: "element",
                name: node.tagName,
                elements: []
            };

            if (node.attributes) {
                xmlElement.attributes = node.attributes;
            };

            if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
                xmlElement.elements.push({
                    type: "text",
                    text: node.childNodes[0].text
                });
            } else {
                node.childNodes.forEach(child => {
                    if (child.nodeType === 1) {
                        xmlElement.elements.push(htmlToXml(child));
                    } else if (child.nodeType === 3) {
                        xmlElement.elements.push({
                            type: "text",
                            text: child.text
                        });
                    }
                });
            }

            return xmlElement;
        };

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
                                                            text: "Title of your TEI document",
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
                                    elements: [
                                        {
                                            type: "text",
                                            text: htmlWithMilestones,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        const bodyElements = htmlRoot.childNodes.map(node => htmlToXml(node));
        const bodyElement = teiDocument.elements[0].elements[1].elements[0];
        bodyElement.elements = bodyElements;

        /* tei to xml conversion */
        const xmlTei = xmlJs.js2xml(teiDocument, { compact: false, spaces: 2 });

        /* create a txt file */
        const txtFilePath = path.join(__dirname, "..", "tei", `${idEdition}-${idEditor}.xml`);
        fs.writeFile(txtFilePath, xmlTei, "utf8", (err) => {
            if (err) {
                console.error(err);
                return;
            };

            /* set Content-Disposition header to decode escaped characters */
            res.setHeader('Content-Disposition', `attachment; filename="${idEdition}-${idEditor}.xml"`);

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

module.exports = router;