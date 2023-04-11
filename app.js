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
const driver = neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PW));

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
app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: false,
    parameterLimit: 50000
}));

/* express flash */
app.use(flash());

/* sessions */
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: oneDay
    }
}));

/* passport */
app.use(passport.initialize());
app.use(passport.session());

/* override post method */
app.use(methodOverride("_method"));

/* cookies */
app.use(cookieParser());

/* cors */
const cors = require("cors");
app.use(cors({
    origin: "*",
    methods: ["GET","POST","DELETE","UPDATE", "PUT", "PATCH"]
}));

/* index */
app.get(process.env.URL_PATH, checkAuthenticated, (req, res) => {

    /* store the current url in a cookie */
    var test_url_1 = res.cookie["test_url_1"];
    var test_url_2 = res.cookie["test_url_2"];
    var prevUrl;

    /* test_url_1 */
    if (test_url_1 == undefined) {
        res.cookie("test_url_1", req.originalUrl, { overwrite: true });
    } else {
        test_url_1 = res.cookie["test_url_1"];
    };

    /* test_url_2 */
    if (test_url_2 == undefined) {
        res.cookie("test_url_2", req.originalUrl, { overwrite: true });
    } else {
        test_url_2 = res.cookie["test_url_2"];
    };

    /* update the second url to become the previous one in the next page */
    res.cookie("test_url_1", req.cookies["test_url_2"], { overwrite: true });
    res.cookie("test_url_2", req.originalUrl, { overwrite: true });

    /* store the current url in a cookie */
    if (req.originalUrl !== req.cookies["test_url_2"]) {
        req.cookies["test_url_1"] = req.cookies["test_url_2"];
        prevUrl = req.cookies["test_url_1"];
    } else {
        const { headers: { cookie } } = req;
        if (cookie) {
            const values = cookie.split(';').reduce((res, item) => {
                const data = item.trim().split('=');
                return { ...res, [data[0]]: data[1] };
            }, {});
            res.locals.cookie = values;
        }
        else res.locals.cookie = {};

        prevUrl = res.locals.cookie["test_url_1"].replace(/%2F/g, "/");
    };

    /* page rendering */
    res.render("index", { name: req.user.name });

});

/* login system */
/* register */
app.get(process.env.URL_PATH + "/register", checkNotAuthenticated, async (req, res) => {
    res.render("register");
});

app.post(process.env.URL_PATH + "/register", checkNotAuthenticated, async (req, res) => {
    try {
        /* crypt the password */
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        /* registered users */
        var registeredUsers = [];

        /* insert user in the db */
        const session = driver.session();
        try {
            await session.writeTransaction(tx => tx
                .run(
                    `
                    OPTIONAL MATCH (editors:Editor)
                    MERGE (editor:Editor {email: "${req.body.email}"})
                    ON CREATE SET editor.name = "${req.body.name}", editor.password = "${hashedPassword}"
                    RETURN editors, id(editor), editor.name, editor.email, editor.password
                    `
                )
                .subscribe({
                    onNext: record => {

                        /* registerd users */
                        if (record.get("editors") !== null) {
                            if (!registeredUsers.includes(record.get("editors")["properties"]["email"])) {
                                registeredUsers.push(record.get("editors")["properties"]["email"]);
                            };
                        };

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
        /* the user with the inserted mail does not exist */
        if (!registeredUsers.includes(req.body.email)) {
            res.redirect(process.env.URL_PATH + "/login");
        } else {
            /* the user with the inserted mail exist */
            res.render("register", {
                errorMessage: "The user with the mail " + req.body.email + " already exists."
            });
        };
    };
});

/* login */
app.get(process.env.URL_PATH + "/login", checkNotAuthenticated, async (req, res) => {
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
                        console.log("List of users ready");
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

app.post(process.env.URL_PATH + "/login", checkNotAuthenticated,
    /* if the user is not authenticates, send her to login */
    passport.authenticate("local", {
        failureRedirect: process.env.URL_PATH + "/login",
        failureFlash: true
    }),

    /* cookie */
    (req, res) => {
        req.session.user = req.body.email;
        res.cookie("session", req.session, { expire: 500000 + Date.now() });
        res.redirect(process.env.URL_PATH + "/");
    }
);

/* logout */
app.delete(process.env.URL_PATH + "/logout", (req, res) => {
    req.logOut((err) => {
        if (err) { return next(err); };
        res.redirect(process.env.URL_PATH + "/login");
    });
});

/* account */
const account = require("./routes/account");
app.use("/", account, checkAuthenticated);

/* get started */
const getStarted = require("./routes/getStarted");
app.use("/", getStarted);

/* api key */
const apikey = require("./routes/apikey");
app.use("/", apikey, checkAuthenticated);

/* edit */
const edit = require("./routes/edit");
app.use("/", edit, checkAuthenticated);

/* add file */
const addFile = require("./routes/addFile");
app.use("/", addFile);

/* add witnesses */
const addWitnesses = require("./routes/forms/metadata/addWitnesses");
app.use("/", addWitnesses);

/* add philological note */
const addPhilologicalNote  = require("./routes/forms/metadata/addPhilologicalNote");
app.use("/", addPhilologicalNote);

/* add apparatus */
const addApparatus = require("./routes/forms/apparatus/addApparatus");
app.use("/", addApparatus);

/* add translation */
const addTranslation = require("./routes/forms/translation/addTranslation");
app.use("/", addTranslation);

/* add parallel */
const addParallel = require("./routes/forms/parallel/addParallel");
app.use("/", addParallel);

/* add commentary */
const addCommentary = require("./routes/forms/commentary/addCommentary");
app.use("/", addCommentary);

/* add citation */
const addCitation = require("./routes/forms/citation/addCitation");
app.use("/", addCitation);

/* add note */
const addNote = require("./routes/forms/note/addNote");
app.use("/", addNote);

/* save file */
const saveFile = require("./routes/saveFile");
app.use("/", saveFile, cors());

/* publish */
const publish = require("./routes/publish");
app.use("/", publish);

/* get the edition */
const edition = require("./routes/edition");
app.use("/", edition, checkAuthenticated);

/* get the list of editions */
const editions = require("./routes/editions");
const { Console } = require("console");
app.use("/", editions, checkAuthenticated);

/* documentation */
const documentation = require("./routes/documentation");
app.use("/", documentation, checkAuthenticated);

/* credits */
const credits = require("./routes/credits");
app.use("/", credits, checkAuthenticated);

/* do not allow non-authenticated users */
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect(process.env.URL_PATH + "/login");
    };
};

/* do not go back to login if logged users */
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect(process.env.URL_PATH);
    } else {
        next();
    };
};

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Shivadharma listening on port localhost:${port}${process.env.URL_PATH}`));

module.exports = app;