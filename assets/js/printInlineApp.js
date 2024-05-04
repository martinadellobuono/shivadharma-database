var stanzas = document.querySelectorAll("span[data-type='printTxtStr'][data-text-structure='Stanza']");
var stanzasArray = Array.from(stanzas);

stanzasArray.forEach((stanza) => {
    var txtStructure = stanza.getAttribute("data-text-structure");
    var txtStructureN = stanza.getAttribute("data-n");

    /* INLINE APPARATUS */
    var appStanzas = document.querySelectorAll("span[data-type='apparatus'][data-subtype='stanzaStart'][data-n='" + txtStructureN + "']");
    if (appStanzas.length > 0) {
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
        collapseApp.setAttribute("class", "collapse fs-xs p-3 border rounded bg-light-blue inlineAppDiv");
        collapseApp.setAttribute("id", txtStructure + "-" + txtStructureN);
        collapseApp.setAttribute("data-type", "inlineApp");
        collapseApp.setAttribute("data-n", txtStructureN);

        /* append the app card to the stanza */
        stanza.append(collapseApp);

        /* print data in the card */
        var inlineApp = document.querySelector("div[data-type='inlineApp'][data-n='" + txtStructureN + "']");
        for (var i = 0; i < appStanzas.length; i++) {
            var appEntry = appStanzas[i].parentElement.innerHTML;
            inlineApp.innerHTML += "<div>" + appEntry + "</div>";
        };
    };

    /* INLINE PARALLELS */
    var parStanzas = document.querySelectorAll(".par-stanza[data-n='" + txtStructureN + "']");
    if (parStanzas.length > 0) {
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
        collapsePar.setAttribute("class", "collapse fs-xs p-3 border rounded bg-light-orange inlineAppDiv");
        collapsePar.setAttribute("id", "par-" + txtStructure + "-" + txtStructureN);
        collapsePar.setAttribute("data-type", "inlinePar");
        collapsePar.setAttribute("data-n", txtStructureN);

        /* append the app card to the stanza */
        stanza.append(collapsePar);

        /* print data in the card */
        var inlinePar = document.querySelector("div[data-type='inlinePar'][data-n='" + txtStructureN + "']");
        parStanzas.forEach((parStanza) => {
            var parallel = parStanza.closest("div[data-type='parallel'][data-subtype='parallel']").innerHTML;
            inlinePar.innerHTML += "<div class='ff-edition-app'>" + parallel + "</div>";
        });
    };
});