const express = require("express");
const path = require("path");
const formidable = require("formidable");
const bodyParser = require("body-parser");
const fs = require("fs");

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post("/publish/:id",
    async (req, res) => {
        console.log("La richiesta è...");
    });

module.exports = router;