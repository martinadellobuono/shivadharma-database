/*
    File txtAppScroll.js
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

/* scroll to the apparatus lemma in the textus */

var appEntries = document.querySelectorAll("span[data-type='annotation-object']");

for (var i = 0; i < appEntries.length; i++) {
    appEntries[i].addEventListener("click", (e) => {
        var idTxtEntry = e.target.getAttribute("data-annotation").split("#")[1];
        var appEntries = document.querySelectorAll(".entries[data-ref='" + idTxtEntry + "']");
        var oldAppEntries = document.querySelectorAll(".entries:not([data-ref='" + idTxtEntry + "'])");
        
        /* remove the underline text-decoration the not corresponding app entry */
        for (var i = 0; i < oldAppEntries.length; i++) {
            var txtEntry = oldAppEntries[i];           
            txtEntry.classList.remove("app-entry");
        };
        
        /* add the underline text-decoration the corresponding app entry and scroll */
        for (var i = 0; i < appEntries.length; i++) {
            var txtEntry = appEntries[i];           
            txtEntry.classList.add("app-entry");
            txtEntry.scrollIntoView();
        };
    });
};
