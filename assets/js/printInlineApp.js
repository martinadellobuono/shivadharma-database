var stanzas = document.querySelectorAll("span[data-type='printTxtStr'][data-text-structure='Stanza']");

/* create a collapsible card to print inline apparatus */
for (var i = 0; i < stanzas.length; i++) {

    console.log(stanzas[i]);

    var txtStructure = stanzas[i].getAttribute("data-text-structure");
    var txtStructureN = stanzas[i].getAttribute("data-n");

    /* collapse btn */
    var btnCollapse = document.createElement("a");
    btnCollapse.textContent = "app.";
    btnCollapse.setAttribute("class", "yellow-400 fs-xxs");

    btnCollapse.setAttribute("data-bs-toggle", "collapse");
    btnCollapse.setAttribute("data-bs-target", "#" + txtStructure + "-" + txtStructureN);
    btnCollapse.setAttribute("aria-expanded", "false");
    stanzas[i].append(btnCollapse);

    /* collapsible div */
    var collapse = document.createElement("div");
    collapse.setAttribute("class", "collapse p-3 border rounded");
    collapse.setAttribute("id", txtStructure + "-" + txtStructureN);

    /* append the card to the stanza */
    stanzas[i].append(collapse);

    /* print data in the card */
    var appEntries = document.querySelectorAll("div[data-type='apparatus'][data-subtype='entry']");
    for (var i = 0; i < appEntries.length; i++) {
        var appEntry = appEntries[i].querySelector("span[data-type='apparatus'][data-subtype='stanzaStart'][data-n='" + txtStructureN + "']").parentElement.innerHTML;
        collapse.innerHTML = appEntry;
    };
};