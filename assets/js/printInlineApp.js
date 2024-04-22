var stanzas = document.querySelectorAll("span[data-type='printTxtStr'][data-text-structure='Stanza']");
var stanzasArray = Array.from(stanzas);

stanzasArray.forEach((stanza) => {
    var txtStructure = stanza.getAttribute("data-text-structure");
    var txtStructureN = stanza.getAttribute("data-n");
    var appEntryStanza = document.querySelector("span[data-type='apparatus'][data-subtype='stanzaStart'][data-n='" + txtStructureN + "']");
    var parStanza = document.querySelector(".par-stanza[data-n='" + txtStructureN + "']");

    /* INLINE APPARATUS */
    if (appEntryStanza) {
        /* collapse app btn */
        var btnAppCollapse = document.createElement("a");
        btnAppCollapse.textContent = "app.";
        btnAppCollapse.setAttribute("class", "caret-xs blue-600 fs-xxs p-1");
        btnAppCollapse.setAttribute("data-bs-toggle", "collapse");
        btnAppCollapse.setAttribute("data-bs-target", "#" + txtStructure + "-" + txtStructureN);
        btnAppCollapse.setAttribute("aria-expanded", "false");
        stanza.append(btnAppCollapse);

        /* collapsible app div */
        var collapseApp = document.createElement("div");
        collapseApp.setAttribute("class", "collapse fs-xs p-3 border rounded bg-light-blue");
        collapseApp.setAttribute("id", txtStructure + "-" + txtStructureN);
        collapseApp.setAttribute("data-type", "inlineApp");
        collapseApp.setAttribute("data-n", txtStructureN);

        /* append the app card to the stanza */
        stanza.append(collapseApp);

        /* print data in the card */
        var appEntry = appEntryStanza.parentElement.innerHTML;
        var inlineApp = document.querySelector("div[data-type='inlineApp'][data-n='" + txtStructureN + "']");
        inlineApp.innerHTML = appEntry;
    };

    /* INLINE PARALLELS */
    if (parStanza) {
        /* collapse parallel btn */
        var btnParCollapse = document.createElement("a");
        btnParCollapse.textContent = "par.";
        btnParCollapse.setAttribute("class", "caret-xs orange-400 fs-xxs p-1");
        btnParCollapse.setAttribute("data-bs-toggle", "collapse");
        btnParCollapse.setAttribute("data-bs-target", "#par-" + txtStructure + "-" + txtStructureN);
        btnParCollapse.setAttribute("aria-expanded", "false");
        stanza.append(btnParCollapse);

        /* collapsible parallel div */
        var collapsePar = document.createElement("div");
        collapsePar.setAttribute("class", "collapse fs-xs p-3 border rounded bg-light-orange");
        collapsePar.setAttribute("id", "par-" + txtStructure + "-" + txtStructureN);
        collapsePar.setAttribute("data-type", "inlinePar");
        collapsePar.setAttribute("data-n", txtStructureN);

        /* append the app card to the stanza */
        stanza.append(collapsePar);

        /* print data in the card */
        var parallel = parStanza.closest("div[data-type='parallel'][data-subtype='parallel']").innerHTML;
        var inlinePar = document.querySelector("div[data-type='inlinePar'][data-n='" + txtStructureN + "']");
        inlinePar.innerHTML = parallel;
    };

});