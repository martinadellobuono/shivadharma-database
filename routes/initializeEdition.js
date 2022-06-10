const express = require("express");

const router = express.Router();

router.get("/initializeEdition", (req, res) => {
    res.render("initializeEdition");
});

module.exports = router;