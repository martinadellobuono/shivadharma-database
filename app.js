const express = require("express");
const path = require("path");

var app = express();

app.set("views", [
    path.join(__dirname, "views"),
    path.join(__dirname, "views/partials/forms-res/")
]);
app.set("view engine", "ejs");

app.use("/assets", express.static("assets"));
app.use("/node_modules", express.static("node_modules"));
app.use("/views", express.static("views"));

// body parsing limits
const bodyParser = require("body-parser");
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));

// index
app.get("/", (req, res) => {
    res.render("index");
});

// get started
const getStarted = require("./routes/getStarted");
app.use("/", getStarted);

// edit
const edit = require("./routes/edit");
app.use("/", edit);

// add file
const addFile = require("./routes/addFile");
app.use("/", addFile);

// add witnesses
const addWitnesses = require("./routes/forms/metadata/addWitnesses");
app.use("/", addWitnesses);

// add apparatus
const addApparatus = require("./routes/forms/apparatus/addApparatus");
app.use("/", addApparatus);

// add translation
const addTranslation = require("./routes/forms/translation/addTranslation");
app.use("/", addTranslation);

// publish
const publish = require("./routes/publish");
app.use("/", publish);

// get the edition
const edition = require("./routes/edition");
app.use("/", edition);

// get the list of editions
const editions = require("./routes/editions");
app.use("/", editions);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Shivadharma listening on port localhost:${port}`));

module.exports = app;