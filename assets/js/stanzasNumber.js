/*
    File stanzasNumber.js
    Author: Martina Dello Buono
    Author's address: martinadellobuono1@gmail.com
    Copyright (c) 2024 by the author
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

/* add stanza numbers to the textus */
var stanzaSel = document.querySelectorAll(".set-stanza");

for (var i = 0; i < stanzaSel.length; i++) {
    stanzaSel[i].addEventListener("change", (e) => {
        /* get the number of stanza to add to textus milestone end */
        var stanzaN = e.target.value;
        /* get the ID of selected fragment to search it in the textus */
        var selForm = e.target.closest("#textStructure-req");
        var selID = selForm.querySelector("input[name='idAnnotation']").value;
        /* search for the ID in the textus */
        var txt = tinymce.get("fileBaseTxt").getContent();

        var schema = tinymce.get("fileBaseTxt").schema;
        var parser = tinymce.html.DomParser({ validate: true }, schema);
        var rootNode = parser.parse(txt);

        parser.addNodeFilter("p", (nodes, name) => {
            for (var i = 0; i < nodes.length; i++) {
                console.log(nodes[i].name);
            }
        });

        /* console.log(txt.querySelector("span[data-type='milestone'][data-subtype='textStructure'][data-end='end'][data-annotation='#" + selID + "']")); */
    });
};