if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
};

const express = require("express");
const path = require("path");
const { urlencoded } = require("express");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const jwb = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

/* db */
const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "shivadharma_temp_editions"));

/* login system */
const passport = require("passport");
const initializePassport = require("./passport-config");
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);
const users = [];

/* app */
var app = express();

/* views */
app.set("views", [
    path.join(__dirname, "views"),
    path.join(__dirname, "views/partials/forms-res/")
]);
app.set("view engine", "ejs");

/* static files */
app.use("/assets", express.static("assets"));
app.use("/node_modules", express.static("node_modules"));
app.use("/views", express.static("views"));

/* body parsing limits */
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false, parameterLimit: 50000 })); /* extended: true */

/* express flash / session */
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

/* passport */
app.use(passport.initialize());
app.use(passport.session());

/* override post method */
app.use(methodOverride("_method"));

/* cookies */
app.use(cookieParser());

/* index */
app.get("/", (req, res) => {
    res.render("index", { name: "Marti" });
});

/* get started */
const getStarted = require("./routes/getStarted");
app.use("/", getStarted);

/* edit */
const edit = require("./routes/edit");
app.use("/", edit);

/* add file */
const addFile = require("./routes/addFile");
app.use("/", addFile);

/* add witnesses */
const addWitnesses = require("./routes/forms/metadata/addWitnesses");
app.use("/", addWitnesses);

/* add apparatus */
const addApparatus = require("./routes/forms/apparatus/addApparatus");
app.use("/", addApparatus);

/* add translation */
const addTranslation = require("./routes/forms/translation/addTranslation");
app.use("/", addTranslation);

/* publish */
const publish = require("./routes/publish");
app.use("/", publish);

/* get the edition */
const edition = require("./routes/edition");
app.use("/", edition);

/* get the list of editions */
const editions = require("./routes/editions");
app.use("/", editions);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Shivadharma listening on port localhost:${port}`));

module.exports = app;