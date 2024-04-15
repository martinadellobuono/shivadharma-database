const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
const { body, validationResult } = require("express-validator");
const { render } = require("ejs");

/* add text structure */
router.post(process.env.URL_PATH + "/addTextStructure/:id", async (req, res) => {
    var idEdition = req.params.id.split("/").pop().split("-")[0];
    var idEditor = req.params.id.split("/").pop().split("-")[1];
    res.redirect(process.env.URL_PATH + `/edit/${idEdition}-${idEditor}`);
});

module.exports = router;