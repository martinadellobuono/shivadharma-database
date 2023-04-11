const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get(process.env.URL_PATH + "/apikey", async (req, res) => {
    res.render("apikey", { name: req.user.name });
});

router.post(process.env.URL_PATH + "/apikey", async (req, res) => {
    /* check if the api key is correct */
    if (req.body.apikey == process.env.API_KEY) {
        res.redirect("/getStarted");
    } else {
        res.render("apikey", { name: req.user.name, errorMessage: "Incorrect access key" });
    };
});

module.exports = router;