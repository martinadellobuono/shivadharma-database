/* dotenv */
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
};

/* libraries */
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
app.get("/", checkAuthenticated, (req, res) => {
    res.render("index", { name: req.user.name });
});

/* login system */
/* register */
app.get("/register", checkNotAuthenticated, async (req, res) => {
    res.render("register");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        /* crypt the password */
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        /* insert user in the db */
        const session = driver.session();
        try {
            await session.writeTransaction(tx => tx
                .run(
                    `
                    MERGE (editor:Editor {name: "${req.body.name}", email: "${req.body.email}", password: "${hashedPassword}"})
                    RETURN id(editor), editor.name, editor.email, editor.password
                    `
                )
                .subscribe({
                    onNext: record => {
                        /* user id */
                        var ids = [];
                        var id;
                        if (!ids.includes(record.get("id(editor)"))) {
                            ids.push(record.get("id(editor)"));
                        };
                        ids.forEach(el => {
                            id = el["low"];
                        });
                        /* save the user */
                        users.push({
                            id: id,
                            name: record.get("editor.name"),
                            email: record.get("editor.email"),
                            password: record.get("editor.password")
                        });
                    },
                    onCompleted: () => {
                        console.log("Data added to the database")
                    },
                    onError: err => {
                        console.log(err)
                    }
                })
            );
        } catch (err) {
            console.log(err);
        } finally {
            await session.close();
        };
    } catch (err) {
        console.log(err);
    } finally {
        res.redirect("/login");
    };
});

/* login */
app.get("/login", checkNotAuthenticated, async (req, res) => {
    try {
        /* get users from the db */
        const session = driver.session();
        try {
            await session.readTransaction(tx => tx
                .run(
                    `
                    MATCH (editor:Editor)
                    RETURN id(editor), editor.name, editor.email, editor.password
                    `
                )
                .subscribe({
                    onNext: record => {
                        /* user id */
                        var ids = [];
                        var id;
                        if (!ids.includes(record.get("id(editor)"))) {
                            ids.push(record.get("id(editor)"));
                        };
                        ids.forEach(el => {
                            id = el["low"];
                        });
                        /* list of users */
                        users.push({
                            id: id,
                            name: record.get("editor.name"),
                            email: record.get("editor.email"),
                            password: record.get("editor.password")
                        });
                    },
                    onCompleted: () => {
                        console.log("List of users ready")
                    },
                    onError: err => {
                        console.log(err)
                    }
                })
            );
        } catch (err) {
            console.log(err);
        } finally {
            await session.close();
        };
    } catch (err) {
        console.log(err);
    } finally {
        res.render("login");
    };
});

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

/* logout */
app.delete("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) { return next(err); };
        res.redirect("login");
    });
});

/* account */
app.get("/account", checkAuthenticated, (req, res) => {
    res.render("account", { name: req.user.name });
});

/* get started */
app.get("/getstarted", checkAuthenticated, (req, res) => {
    res.render("getstarted", { name: req.user.name });
});

const getStarted = require("./routes/getStarted");
app.use("/", getStarted);

/* api key */
app.get("/apikey", checkAuthenticated, (req, res) => {
    res.render("apikey", { name: req.user.name });
});

app.post("/apikey", checkAuthenticated, async (req, res) => {
    /* check if the api key is correct */
    if (req.body.apikey == process.env.API_KEY) {
        res.render("getStarted", { name: req.user.name });
    } else {
        res.render("apikey", { name: req.user.name, errorMessage: "Incorrect access key" });
    };
});

/* do not allow non-authenticated users */
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    };
    res.redirect("/login");
};

/* do not go back to login if logged users */
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    };
    next();
};

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

/* add commentary */
const addCommentary = require("./routes/forms/commentary/addCommentary");
app.use("/", addCommentary);

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