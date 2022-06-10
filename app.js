const express = require("express");
const path = require("path");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/assets", express.static("assets"));
app.use("/views", express.static("views"));

// index
app.get("/", (req, res) => {
    res.render("index");
});

// initialize the edition
const initializeEdition = require("./routes/initializeEdition");
app.use("/", initializeEdition);

// get started
const getStarted = require("./routes/getStarted");
app.use("/", getStarted);

// add metadata
const addMetadata = require("./routes/addMetadata");
app.use("/", addMetadata);

// add file
const addFile = require("./routes/addFile");
app.use("/", addFile);

// add apparatus
const addApparatus = require("./routes/forms/apparatus/addApparatus");
app.use("/", addApparatus);

// get the edition
const edition = require("./routes/edition");
app.use("/", edition);

// get the list of editions
const editions = require("./routes/editions");
app.use("/", editions);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Shivadharma listening on port localhost:${port}`));

module.exports = app;