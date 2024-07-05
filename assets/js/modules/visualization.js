/* ui modules */
import { tooltips } from "../modules/ui.js";

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

/* print inline apparatus and parallels */
export const printInlineApp = () => {
    var stanzas = document.querySelectorAll("span[data-type='printTxtStr'][data-text-structure='Stanza']");
    for (var i = 0; i < stanzas.length; i++) {
        var txtStructure = stanzas[i].getAttribute("data-text-structure");
        var txtStructureN = stanzas[i].getAttribute("data-n");

        /* APPARATUS */
        var appStanzas = document.querySelectorAll("span[data-type='apparatus'][data-subtype='stanzaStart'][data-n='" + txtStructureN + "']");
        if (appStanzas.length > 0) {
            /* collapse app btn */
            var btnAppCollapse = document.createElement("a");
            btnAppCollapse.textContent = "app.";
            btnAppCollapse.setAttribute("class", "caret-xs blue-600 fs-xxs p-1");
            btnAppCollapse.setAttribute("data-bs-toggle", "collapse");
            btnAppCollapse.setAttribute("data-bs-target", "#" + txtStructure + "-" + txtStructureN);
            btnAppCollapse.setAttribute("aria-expanded", "false");
            
            /* append the app. btn to the stanza */
            stanzas[i].append(btnAppCollapse);

            /* collapsible app div */
            var collapseApp = document.createElement("div");
            collapseApp.setAttribute("class", "collapse fs-xs p-3 border rounded bg-light-blue inlineAppDiv");
            collapseApp.setAttribute("id", txtStructure + "-" + txtStructureN);
            collapseApp.setAttribute("data-type", "inlineApp");
            collapseApp.setAttribute("data-n", txtStructureN);

            /* append the app card to the stanza */
            stanzas[i].append(collapseApp);

            /* print data in the card */
            var appEntries = document.querySelectorAll(".app-txt");

            for (var k = 0; k < appEntries.length; k++) {
                var txt = appEntries[k];
                var stanza = txt.getAttribute("data-n");
                var appID = txt.getAttribute("data-ref");
                
                if (txtStructureN == stanza) {
                    collapseApp.innerHTML += '<div>' + '<span data-ref="#pills-apparatus">' + '<i class="bi bi-caret-right-fill entries blue-600 txtApp-scroll" data-bs-toggle="tooltip" data-bs-html="true" data-bs-custom-class="tooltip-blue-600" data-bs-title="Check in <i>Apparatus</i>" data-bs-placement="top" data-type="apparatus" data-ref="' + appID + '" data-bs-original-title="" title=""></i>' + txt.innerHTML + '</span>'+ '</div>';
                };
            };
        };

        /* PARALLELS */
        var parStanzas = document.querySelectorAll(".par-stanza[data-n='" + txtStructureN + "']");
        if (parStanzas.length > 0) {

            /* collapsible btn */
            var btnParCollapse = document.createElement("a");
            btnParCollapse.textContent = "par.";
            btnParCollapse.setAttribute("class", "caret-xs orange-400 fs-xxs p-1");
            btnParCollapse.setAttribute("data-bs-toggle", "collapse");
            btnParCollapse.setAttribute("data-bs-target", "#par-" + txtStructure + "-" + txtStructureN);
            btnParCollapse.setAttribute("aria-expanded", "false");
            
            /* append the par. btn to the stanza */
            stanzas[i].append(btnParCollapse);

            /* collapsible parallel div */
            var collapsePar = document.createElement("div");
            collapsePar.setAttribute("class", "collapse fs-xs p-3 border rounded bg-light-orange inlineAppDiv");
            collapsePar.setAttribute("id", "par-" + txtStructure + "-" + txtStructureN);
            collapsePar.setAttribute("data-type", "inlinePar");
            collapsePar.setAttribute("data-n", txtStructureN);

            /* append the app card to the stanza */
            stanzas[i].append(collapsePar);

            /* print parallel */
            var parallels = document.querySelectorAll(".parallel-txt");
            for (var k = 0; k < parallels.length; k++) {
                var txt = parallels[k];
                var stanza = txt.getAttribute("data-n");
                var title = txt.getAttribute("data-title");
                var parallelID = txt.getAttribute("data-ref");

                if (txtStructureN == stanza) {
                    collapsePar.innerHTML += '<span data-ref="#pills-parallel"><i class="bi bi-caret-right-fill entries orange-400 txtApp-scroll" data-bs-toggle="tooltip" data-bs-html="true" data-bs-custom-class="tooltip-orange-400" data-bs-title="Check in <i>Parallels</i>" data-bs-placement="top" data-type="parallel" data-ref="' + parallelID + '" data-bs-original-title="" title=""></i>' + '<span class="fw-bold">' + title + '</span></span>' + txt.innerHTML;
                };
            };

            /* activate tooltips */
            tooltips();
        };
    };

    /* scroll from the stanza to the app */
    txtAppScroll();
};

/* scroll to the apparatus lemma in the apparatus starting from the textus */
export const txtAppScroll = () => {
    var txtToAppBtn = document.querySelectorAll(".txtApp-scroll");
    for (var i = 0; i < txtToAppBtn.length; i++) {
        var btn = txtToAppBtn[i];

        /* click on button to pass from txt to app */
        btn.addEventListener("click", (e) => {
            var txtID = e.target.getAttribute("data-ref");
            var category = e.target.parentElement.getAttribute("data-ref");
            var pill = document.querySelector("button[data-pill='" + category + "']");

            /* open the tab */
            pill.click();

            /* scroll to the full txt in app */
            var txt = document.querySelector("div[data-ref='" + txtID + "']");
            txt.scrollIntoView();

            /* remove prev clicked elements */
            var prevEl = document.querySelectorAll(".remove-bg");
            for (var k = 0; k < prevEl.length; k++) {
                prevEl[k].classList.remove("parallel-color");
                prevEl[k].classList.remove("remove-bg");
            };

            /* change bg color to the full txt in app */
            txt.classList.add("parallel-color");
            txt.classList.add("remove-bg");
        });
    };
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

                                /* go to the entry */
                                var entryBtn = document.querySelector("[data-bs-target='#pills" + category + "']");
                                console.log(entryBtn);
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