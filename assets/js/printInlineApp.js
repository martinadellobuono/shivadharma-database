var stanzas = document.querySelectorAll("span[data-type='printTxtStr'][data-text-structure='Stanza']");
var stanzasArray = Array.from(stanzas);

stanzasArray.forEach((stanza) => {
    var txtStructure = stanza.getAttribute("data-text-structure");
    var txtStructureN = stanza.getAttribute("data-n");
    var appEntryStanza = document.querySelector("span[data-type='apparatus'][data-subtype='stanzaStart'][data-n='" + txtStructureN + "']");
    
    if (appEntryStanza) {
        /* collapse btn */
        var btnCollapse = document.createElement("a");
        btnCollapse.textContent = "app.";
        btnCollapse.setAttribute("class", "caret-xs yellow-600 fs-xxs p-1");
        btnCollapse.setAttribute("data-bs-toggle", "collapse");
        btnCollapse.setAttribute("data-bs-target", "#" + txtStructure + "-" + txtStructureN);
        btnCollapse.setAttribute("aria-expanded", "false");
        stanza.append(btnCollapse);

        /* collapsible div */
        var collapse = document.createElement("div");
        collapse.setAttribute("class", "collapse p-3 border rounded");
        collapse.setAttribute("id", txtStructure + "-" + txtStructureN);
        collapse.setAttribute("data-type", "inlineApp");
        collapse.setAttribute("data-n", txtStructureN);

        /* append the card to the stanza */
        stanza.append(collapse);

        /* print data in the card */
        var appEntry = appEntryStanza.parentElement.innerHTML;
        var inlineApp = document.querySelector("div[data-type='inlineApp'][data-n='" + txtStructureN + "']");
        inlineApp.innerHTML = appEntry;
    };
});