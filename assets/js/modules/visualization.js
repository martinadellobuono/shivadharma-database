/* edition visualisation */
/* apparatus/textus scroll */
/* scroll to the apparatus lemma in the textus */
export const appTxtScroll = () => {
    var appEntries = document.querySelectorAll(".entries");
    for (var i = 0; i < appEntries.length; i++) {
        appEntries[i].addEventListener("click", (e) => {
            var idAppEntry = e.target.getAttribute("data-ref");
            var category = e.target.getAttribute("data-type");
            var milestoneEntry = document.querySelector("span[data-type='milestone'][data-start='start'][data-subtype='" + category + "'][data-annotation='#" + idAppEntry + "']");
            var txtToColor = document.querySelectorAll("span[data-type='annotation-object'][data-subtype='" + category + "'][data-annotation='#" + idAppEntry + "']");

            /* remove the prev clicked entities */
            var prevClicked = document.querySelectorAll(".clicked");
            for (var i = 0; i < prevClicked.length; i++) {
                prevClicked[i].className = "";
            };

            /* remove the underline text-decoration to the not corresponding app entry */
            var entries = document.querySelectorAll(".app-entry");
            for (var i = 0; i < entries.length; i++) {
                entries[i].className = "";
            };

            /* add the underline text-decoration to the corresponding app entry */
            for (var i = 0; i < txtToColor.length; i++) {
                txtToColor[i].classList.add("app-entry");
                txtToColor[i].classList.add("clicked");
                txtToColor[i].classList.add(category + "-color");
            };

            /* scroll to the app entry */
            milestoneEntry.scrollIntoView();
        });
    };
};

/* print inline apparatus */
export const printInlineApp = () => {
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

            /* modify printed parallels */
            var inlineParallels = document.querySelectorAll(".ff-edition-app");
            for (var i = 0; i < inlineParallels.length; i++) {
                /* modify data-bs-target */
                var collapsibleTitle = inlineParallels[i].querySelector(".caret");
                var collapsibleTitleVal = collapsibleTitle.getAttribute("data-bs-target");
                collapsibleTitle.setAttribute("data-bs-target", collapsibleTitleVal + "___" + i);

                /* modify collapsible div */
                var collapsibleDiv = inlineParallels[i].querySelector(".inlineAppDiv");
                var collapsibleDivVal = collapsibleDiv.getAttribute("id");
                collapsibleDiv.setAttribute("id", collapsibleDivVal + "___" + i);

                /* modify note title */
                var collapsibleNoteTitle = inlineParallels[i].querySelector(".btn-note");
                var collapsibleNoteTitleVal = collapsibleNoteTitle.getAttribute("data-bs-target");
                collapsibleNoteTitle.setAttribute("data-bs-target", collapsibleNoteTitleVal + "___" + i);

                /* modify note body */
                var collapsibleNoteBody = inlineParallels[i].querySelector(collapsibleNoteTitleVal);
                collapsibleNoteBody.setAttribute("id", collapsibleNoteTitleVal.split("#")[1] + "___" + i);

                /* hide tooltips */
                var tooltipLink = inlineParallels[i].querySelector(".tooltip-link");
                tooltipLink.classList.add("d-none");
            };
        };
    });
};

/* scroll to the apparatus lemma in the apparatus starting from the textus */
export const txtAppScroll = () => {
    /* var appEntries = document.querySelectorAll("span[data-type='annotation-object']");

    for (var i = 0; i < appEntries.length; i++) {
        appEntries[i].addEventListener("click", (e) => {
            var idTxtEntry = e.target.getAttribute("data-annotation").split("#")[1];
            var appEntries = document.querySelectorAll(".entries[data-ref='" + idTxtEntry + "']");
            var oldAppEntries = document.querySelectorAll(".entries:not([data-ref='" + idTxtEntry + "'])"); */

    /* remove the underline text-decoration the not corresponding app entry */
    /* for (var i = 0; i < oldAppEntries.length; i++) {
        var txtEntry = oldAppEntries[i];
        txtEntry.classList.remove("app-entry");
    }; */

    /* add the underline text-decoration the corresponding app entry and scroll */
    /* for (var i = 0; i < appEntries.length; i++) {
        var txtEntry = appEntries[i];
        txtEntry.classList.add("app-entry");
        txtEntry.scrollIntoView();
    };
});
}; */
};

/* highlight all the annotation objects when hovering only one */
export const hoverAll = () => {
    var annotations = document.querySelectorAll('span[data-type="annotation-object"]');
    annotations.forEach((annotation) => {
        /* click / mouseover */
        "click mouseover mouseout".split(" ").forEach((event) => {
            annotation.addEventListener(event, (e) => {
                e.stopPropagation();
                var category = e.target.getAttribute("data-subtype");

                /* remove all the prev clicked */
                if (event == "click") {
                    var prevClicked = document.querySelectorAll(".clicked");
                    prevClicked.forEach((el) => {
                        el.className = "";
                    });
                };

                /* avoid highlighting textstructure but the parent annotation */
                if (category == "textStructure") {
                    if (category == "textStructure") {
                        var annotationParent = e.target.parentElement;

                        /* continue to traverse up until you find a parent that does not have the attribute data-subtype with textStructure value */
                        while (annotationParent && annotationParent.getAttribute('data-subtype') === "textStructure") {
                            annotationParent = annotationParent.parentElement;
                        };

                        /* at this point, annotationParent is the first parent that does not have the attribute data-subtype with textStructure value */
                        if (annotationParent) {
                            /* highlight the parent */
                            category = annotationParent.getAttribute("data-subtype");
                            /* if click / mouseover */
                            annotationParent.classList.add(category + "-color");

                            /* if clicked, add clicked class to add/remove color when clicking a new annotation */
                            if (event == "click") {
                                annotationParent.classList.add("clicked");
                                annotationParent.classList.add(category + "-color");                             
                            };

                            /* if mouseout */
                            if (event == "mouseout" && !annotationParent.classList.contains("clicked")) {
                                annotationParent.classList.remove(category + "-color");
                            };

                            /* other annotations sharing the same data-annotation value */
                            var annotationID = annotationParent.getAttribute("data-annotation");
                            var otherAnnotations = document.querySelectorAll('span[data-type="annotation-object"][data-subtype="' + category + '"][data-annotation="' + annotationID + '"]');
                            otherAnnotations.forEach((otherAnnotation) => {
                                /* if click / mouseover */
                                otherAnnotation.classList.add(category + "-color");

                                /* if clicked, add clicked class to add/remove color when clicking a new annotation */
                                if (event == "click") {
                                    otherAnnotation.classList.add("clicked");
                                };

                                /* if mouseout */
                                if (event == "mouseout" && !otherAnnotation.classList.contains("clicked")) {
                                    otherAnnotation.classList.remove(category + "-color");
                                };
                            });
                        } else {
                            console.log("No parents.");
                        };
                    };
                } else {
                    /* highlight the e.target annotation */
                    /* if click / mouseover */
                    e.target.classList.add(category + "-color");

                    /* if clicked, add clicked class to add/remove color when clicking a new annotation */
                    if (event == "click") {
                        e.target.classList.add("clicked");
                    };

                    /* if mouseout */
                    if (event == "mouseout" && !e.target.classList.contains("clicked")) {
                        e.target.classList.remove(category + "-color");
                    };

                    /* other annotations sharing the same data-annotation value */
                    var annotationID = e.target.getAttribute("data-annotation");
                    var otherAnnotations = document.querySelectorAll('span[data-type="annotation-object"][data-subtype="' + category + '"][data-annotation="' + annotationID + '"]');
                    otherAnnotations.forEach((otherAnnotation) => {
                        /* if click / mouseover */
                        otherAnnotation.classList.add(category + "-color");

                        /* if clicked, add clicked class to add/remove color when clicking a new annotation */
                        if (event == "click") {
                            otherAnnotation.classList.add("clicked");
                        };

                        /* if mouseout */
                        if (event == "mouseout" && !otherAnnotation.classList.contains("clicked")) {
                            otherAnnotation.classList.remove(category + "-color");
                        };
                    });
                };
            });
        });
    });
};