/*
    File credits.js
    Author: Martina Dello Buono
    Author's address: martinadellobuono1@gmail.com
    Copyright (c) 2023 by the author
    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.
    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
    SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
    OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
    CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
router.use(bodyParser.json({ limit: "50mb" }));
router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

router.get(process.env.URL_PATH + "/credits", async (req, res) => {

    /* store the current url in a cookie */
    /* previous url */
    var prevUrl;

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
    res.render("credits", {
        prevUrl: prevUrl,
        name: req.user.name,
        email: req.user.email
    });

});

module.exports = router;