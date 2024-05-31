/* ui modules */
import { alerts, currentDate, currentTime, navbarBg, navbarActive, popovers, tabs, tooltips } from "./modules/ui.js";
/* validation modules */
import { autocomplete, dependingForms, cloneEl, truncation, lemmaVariantPresence, inlineLocation } from "./modules/forms.js";
/* forms */
import { preventEnter } from "./modules/validation.js";
/* edition visualisation modules */
import { appTxtScroll, printInlineApp, txtAppScroll } from "./modules/visualization.js";
/* text annotation modules */
import { annotations, previewAnnotations, modifyAnnotations, hideAnnotations, closeBtn} from "./modules/text-annotation.js";
/* edition editing modules */
import { fileTextarea, saveFile5sec, stopLoading } from "./modules/saveFile.js";
import { publishEdition } from "./modules/publish.js";
/* edition metadata modules */
import { metadataTextareas, witnessDimensions } from "./modules/metadata.js";
/* edition export modules */
import { downloadTei, downloadTxt, generatePDF } from "./modules/export.js";
/* sanskrit features modules */
import { devanagariConverter } from "./modules/sanskrit-features.js";

/* document ready */
document.addEventListener("DOMContentLoaded", () => {
    /* every path */
    navbarBg();
    navbarActive();
    alerts();
    popovers();
    tooltips();
    tabs();
    currentDate();
    currentTime();
    /* specific paths */
    const path = window.location.pathname;
    /* create an edition */
    if (path.includes("/apikey")) {
        preventEnter();
    };
    /* edit */
    if (path.includes("/edit/")) {
        fileTextarea();
        metadataTextareas();
        witnessDimensions();
        saveFile5sec();
        stopLoading();
        annotations();
        previewAnnotations();
        closeBtn();
        modifyAnnotations();
        hideAnnotations();
        publishEdition();
    };
    /* edition */
    if (path.includes("/edition/")) {
        appTxtScroll();
        txtAppScroll();
        printInlineApp();
        downloadTei();
        downloadTxt();
        generatePDF();
        devanagariConverter();
    };
    autocomplete();
    dependingForms();
    cloneEl();
    truncation();
    lemmaVariantPresence();
    inlineLocation();
});