import { saveFile } from "./saveFile.js";

var data;

/* annotations */
export const annotations = () => {
    [].forEach.call(document.querySelectorAll(".btn-annotation"), (el) => {

        /* annotation type */
        var annType = el.getAttribute("data-value");

        /* CLICK ON THE BUTTON TO ADD ANNOTATIONS */
        el.addEventListener("click", () => {
            /* block all the buttons */
            const btns = document.querySelectorAll(".btn-set-annotation button");
            for (var i = 0; i < btns.length; i++) {
                btns[i].setAttribute("disabled", "disabled");
            };

            /* type of annotation */
            var category = el.getAttribute("data-value");

            /* live check if apparatus */
            if (category == "apparatus") {
                liveCheck();
                liveCheckPresence();
            };

            /* root ID of annotation */
            var idAnnotation = category + Math.random().toString(16).slice(2) + (new Date()).getTime();

            /* get selected text */
            if (document.getSelection) {
                if (tinymce.activeEditor.selection.getContent() !== "") {

                    /* textual string selected */
                    var txtSel = tinymce.activeEditor.selection;

                    /* OPEN THE BOX */
                    /* close the open box */
                    closeAnnotationBox();

                    /* top annotations resize */
                    var bigger = el.closest(".enlarge-col");
                    if (bigger !== null) {
                        var toHide = document.querySelector(".annotations-box-below");
                        toHide.classList.add("d-none");
                        toHide.classList.remove("d-block");
                        bigger.classList.remove("col-md-1");
                        bigger.classList.add("col-md-4");
                        bigger.classList.add("bg-light");
                        /* hide the button to add annotations */
                        el.classList.add("top-btn");
                        el.classList.add("d-none");
                        el.classList.remove("d-block");
                        /* hide the close button */
                        bigger.querySelector(".btn-close").classList.remove("d-none");
                    } else {
                        /* below annotations resize */
                        var smaller = document.querySelectorAll(".col-md-4.enlarge-col");
                        var toShow = document.querySelector(".annotations-box-below");
                        toShow.classList.add("d-block");
                        toShow.classList.remove("d-none");
                        if (smaller.length > 0) {
                            smaller.forEach((el) => {
                                el.classList.add("col-md-1");
                                el.classList.remove("col-md-4");
                                el.classList.remove("bg-light");
                                /* hide the button to add annotations */
                                el.querySelector(".top-btn").classList.remove("d-none");
                            });
                        };
                    };

                    /* SHOW THE FORMS / HIDE THE NOT SELECTED CATEGORY FORMS */
                    /* show the correct category form */
                    var forms = document.querySelectorAll(".annotation-form." + category);
                    forms.forEach((form) => {
                        form.classList.remove("d-none");
                    });
                    showSelectedFragmentForm();

                    /* click on annotation tab */
                    var formToShow = document.querySelector(".annotation-form." + category);
                    var someTabTriggerEl = formToShow.querySelector("button[data-bs-target='#annotate-" + category + "']")
                    var tab = new bootstrap.Tab(someTabTriggerEl);
                    tab.show();

                    /* selected fragment form */
                    document.querySelector("[name='selectedFragment'][data-value='" + category + "']").value = txtSel.getContent({ format: "text" }).trim();

                    /* assign the ID of each annotation to the root ID inputs */
                    var rootInputs = formToShow.querySelectorAll("input.root-id-input");
                    rootInputs.forEach((input) => {
                        input.value = idAnnotation;
                    });

                    /* assign the ID of each annotation to other inputs - lemma, variants, etc. */
                    var idInputs = formToShow.querySelectorAll("input.id-input");
                    idInputs.forEach((input) => {
                        var idAnnotation = category + Math.random().toString(16).slice(2) + (new Date()).getTime();
                        input.value = idAnnotation;
                    });

                    /* PRINT MILESTONES AND CONTENT IN THE TEXT */
                    let milestoneContent = () => {
                        /* selected string */
                        var sel = txtSel;
                        /* selected range */
                        var rng = sel.getRng();

                        /* create the start milestone */
                        var milestoneStart = document.createElement("span");
                        milestoneStart.setAttribute("data-type", "milestone");
                        milestoneStart.setAttribute("data-subtype", annType);
                        milestoneStart.setAttribute("data-start", "start");
                        /* assign an id to the annotation */
                        milestoneStart.setAttribute("data-annotation", "#" + idAnnotation);
                        /* / */

                        /* create the end milestone */
                        var milestoneEnd = document.createElement("span");
                        milestoneEnd.setAttribute("data-type", "milestone");
                        milestoneEnd.setAttribute("data-subtype", annType);
                        milestoneEnd.setAttribute("data-end", "end");
                        /* assign an id to the annotation */
                        milestoneEnd.setAttribute("data-annotation", "#" + idAnnotation);
                        /* / */

                        /* insert the start milestone */
                        var startRng = rng.cloneRange();
                        startRng.collapse(true);
                        startRng.insertNode(milestoneStart);

                        /* insert the end milestone */
                        var endRng = rng.cloneRange();
                        endRng.collapse(false);
                        endRng.insertNode(milestoneEnd);

                        /* COLOR TO ANNOTATIONS */
                        /* START MILESTONE */
                        /* first sibling of the start milestone */
                        var startSibling = milestoneStart.nextSibling;
                        var startContent = startSibling.textContent;
                        var startAnnotation = document.createElement("span");
                        startAnnotation.setAttribute("data-type", "annotation-object");
                        startAnnotation.setAttribute("data-subtype", annType);
                        /* assign an id to the sibling */
                        startAnnotation.setAttribute("data-annotation", "#" + idAnnotation);
                        /* / */
                        startAnnotation.innerHTML = startContent;
                        startSibling.replaceWith(startAnnotation);

                        if (startAnnotation.parentNode.nodeName == "SPAN") {
                            startAnnotation = startAnnotation.parentNode;
                            while (startAnnotation = startAnnotation.nextSibling) {
                                /* FIRST LINE OF A BLOCK */
                                /* color other siblings if any */
                                if (startAnnotation !== milestoneEnd) {
                                    if (startAnnotation.innerHTML !== "") {
                                        if (startAnnotation.nodeName !== "#text") {
                                            /* already available annotations */
                                            startAnnotation.innerHTML = "<span data-type='annotation-object' data-subtype='" + annType + "'>" + startAnnotation.innerHTML + "</span>"
                                        } else {
                                            /* strings */
                                            var annotation = document.createElement("span");
                                            annotation.setAttribute("data-type", "annotation-object");
                                            annotation.setAttribute("data-subtype", annType);
                                            annotation.innerHTML = startAnnotation.textContent;
                                            var previousSibling = startAnnotation.previousSibling;
                                            if (previousSibling !== null) {
                                                /* insert the annotation after the previous sibling */
                                                previousSibling.insertAdjacentHTML("afterend", annotation.outerHTML);
                                                startAnnotation.textContent = "";
                                            } else {
                                                /* insert the annotation as first child */
                                                var parentNode = startAnnotation.closest("p");
                                                parentNode.insertBefore(annotation, parentNode.firstChild);
                                                startAnnotation.textContent = "";
                                            };
                                        };
                                    };
                                } else {
                                    return false;
                                };
                            };
                        } else {
                            while (startAnnotation = startAnnotation.nextSibling) {
                                /* FIRST LINE OF A BLOCK */
                                /* color other siblings if any */
                                if (startAnnotation !== milestoneEnd) {
                                    if (startAnnotation.innerHTML !== "") {
                                        if (startAnnotation.nodeName !== "#text") {
                                            /* already available annotations */
                                            startAnnotation.innerHTML = "<span data-type='annotation-object' data-subtype='" + annType + "'>" + startAnnotation.innerHTML + "</span>"
                                        } else {
                                            /* strings */
                                            var annotation = document.createElement("span");
                                            annotation.setAttribute("data-type", "annotation-object");
                                            annotation.setAttribute("data-subtype", annType);
                                            annotation.innerHTML = startAnnotation.textContent;
                                            var previousSibling = startAnnotation.previousSibling;
                                            if (previousSibling !== null) {
                                                /* insert the annotation after the previous sibling */
                                                previousSibling.insertAdjacentHTML("afterend", annotation.outerHTML);
                                                startAnnotation.textContent = "";
                                            } else {
                                                /* insert the annotation as first child */
                                                var parentNode = startAnnotation.closest("p");
                                                parentNode.insertBefore(annotation, parentNode.firstChild);
                                                startAnnotation.textContent = "";
                                            };
                                        };
                                    };
                                } else {
                                    return false;
                                };
                            };
                        };

                        /* END MILESTONE */
                        /* first previous sibling of the milestone end */
                        var endSibling = milestoneEnd.previousSibling;
                        var endContent = endSibling.textContent;
                        var endAnnotation = document.createElement("span");
                        endAnnotation.setAttribute("data-type", "annotation-object");
                        endAnnotation.setAttribute("data-subtype", annType);
                        /* assign an id to the sibling */
                        endAnnotation.setAttribute("data-annotation", "#" + idAnnotation);
                        /* / */
                        endAnnotation.innerHTML = endContent;
                        endSibling.replaceWith(endAnnotation);

                        /* END LINE OF A BLOCK */
                        /* color other siblings if any */
                        while (endAnnotation = endAnnotation.previousSibling) {
                            if (endAnnotation !== milestoneStart) {
                                if (endAnnotation.innerHTML !== "") {
                                    if (endAnnotation.nodeName !== "#text") {
                                        /* already available annotations */
                                        endAnnotation.innerHTML = "<span data-type='annotation-object' data-subtype='" + annType + "'>" + endAnnotation.innerHTML + "</span>";
                                    } else {
                                        /* strings */
                                        var annotation = document.createElement("span");
                                        annotation.setAttribute("data-type", "annotation-object");
                                        annotation.setAttribute("data-subtype", annType);
                                        annotation.innerHTML = endAnnotation.textContent;
                                        var previousSibling = endAnnotation.previousSibling;
                                        if (previousSibling !== null) {
                                            /* insert the annotation after the previous sibling */
                                            previousSibling.insertAdjacentHTML("afterend", annotation.outerHTML);
                                            endAnnotation.textContent = "";
                                        } else {
                                            /* insert the annotation as first child */
                                            var parentNode = endAnnotation.parentNode;
                                            parentNode.insertBefore(annotation, parentNode.firstChild);
                                            endAnnotation.textContent = "";
                                        };
                                    };
                                };
                            } else {
                                return false;
                            };
                        };

                        /* PARAGRAPHS IN THE MIDDLE OF THE BLOCK */
                        var startParent = milestoneStart.closest("p");
                        var endParent = milestoneEnd.closest("p");
                        if (startParent !== endParent) {
                            while (startParent = startParent.nextSibling) {
                                if (startParent !== endParent) {
                                    var annotation = document.createElement("span");
                                    annotation.innerHTML = startParent.innerHTML;
                                    annotation.setAttribute("data-type", "annotation-object");
                                    annotation.setAttribute("data-subtype", annType);
                                    /* assign an id to the sibling */
                                    annotation.setAttribute("data-annotation", "#" + idAnnotation);
                                    /* / */
                                    startParent.innerHTML = annotation.outerHTML;
                                } else {
                                    return false;
                                };
                            };
                        };
                    };
                    milestoneContent();

                    /* CANCEL BUTTON */
                    /* assign the same id to the cancel button */
                    var safeCancelBtn = document.querySelector("button[data-type='cancel-annotation']");
                    safeCancelBtn.setAttribute("data-cancel", "#" + idAnnotation);

                    /* init textareas */
                    var selector = "." + category + "-container textarea";

                    tinymce.init({
                        selector: selector,
                        resize: "both",
                        width: "100%",
                        plugins: "preview searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime lists wordcount help charmap quickbars",
                        menubar: "file edit view insert format tools table help",
                        toolbar: "undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap | fullscreen preview save | image media template link anchor codesample | ltr rtl",
                        toolbar_sticky: false,
                        autosave_ask_before_unload: true,
                        autosave_interval: "30s",
                        autosave_prefix: "{path}{query}-{id}-",
                        autosave_restore_when_empty: false,
                        autosave_retention: "2m",
                        image_advtab: true,
                        template_cdate_format: "[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]",
                        template_mdate_format: "[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]",
                        height: "50vh",
                        image_caption: true,
                        quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
                        toolbar_mode: "sliding",
                        contextmenu: "link image table"
                    });

                    /* SAVE FILE */
                    /* save in a json the content to overwrite the file of the textus */
                    var url = window.location.href;
                    var idEdition = url.split("/").pop().split("-")[0];
                    var idEditor = url.split("/").pop().split("-")[1];
                    var form = document.querySelector("#" + category + "-req");
                    var location = form.querySelector(".location");
                    var inputs = location.querySelectorAll("input[type='number']");
                    var submitBtn = form.querySelector("button[type='submit']");

                    let detectEmptyForms = () => {
                        for (var i = 0; i < inputs.length; i++) {
                            if (inputs[i].value !== "") {
                                return true;
                            } else {
                                return false;
                            };
                        };
                    };

                    submitBtn.addEventListener("click", (e) => {
                        if (detectEmptyForms()) {

                            /* add stanza entities */
                            if (submitBtn.classList.contains("btn-txtStr")) {
                                /* send data to the db */
                                try {
                                    /* do not submit the form */
                                    e.preventDefault();

                                    /* text structure number / name */
                                    var txtStrInput = document.getElementById("nTxtStr");
                                    var txtStrNameInput = document.getElementById("textStructureName");
                                    var txtStrN = txtStrInput.value;
                                    var txtStrName = txtStrNameInput.value
                                    /* create the text structure milestone */
                                    var milestoneTxtStr = document.createElement("span");
                                    milestoneTxtStr.setAttribute("data-type", "printTxtStr");
                                    milestoneTxtStr.setAttribute("data-subtype", annType);
                                    /* assign the type of text structure */
                                    milestoneTxtStr.setAttribute("data-text-structure", txtStrName);
                                    /* assign an id to the annotation */
                                    milestoneTxtStr.setAttribute("data-n", txtStrN);
                                    /* / */

                                    /* set the print text structure milestone after the text structure milestone */
                                    var editor = tinymce.get("fileBaseTxt");
                                    if (editor) {
                                        var content = editor.getContent();
                                        /* create a fake element to extract the html */
                                        var tempElement = document.createElement("div");
                                        tempElement.innerHTML = content;
                                        /* text structure milestone */
                                        var specificElement = tempElement.querySelector('span[data-type="milestone"][data-subtype="textStructure"][data-end="end"][data-annotation="' + "#" + idAnnotation + '"]');

                                        /* if the milestone exists */
                                        if (specificElement) {
                                            specificElement.insertAdjacentElement("afterend", milestoneTxtStr);
                                            /* add the print text structure milestone */
                                            editor.setContent(tempElement.innerHTML);
                                        };
                                    };

                                    /* send the file new content to the server */
                                    var contentFile = tinymce.get("fileBaseTxt").getContent();
                                    data = {
                                        idEdition: idEdition,
                                        idEditor: idEditor,
                                        contentFile: contentFile
                                    }

                                    /* save file */
                                    const saveEdition = new Promise((resolve, reject) => {
                                        saveFile(data, (err, result) => {
                                            if (err) {
                                                console.log("Error in saveFile:", err);
                                                reject(err);
                                            } else {
                                                console.log("Result from saveFile:", result);
                                                resolve(result);
                                            }
                                        });
                                    });

                                    saveEdition
                                        .then(() => {
                                            alert(category.charAt(0).toUpperCase() + category.slice(1) + " saved!");
                                            window.location.href = url;
                                        })
                                        .catch(error => {
                                            console.error("Error saving file: ", error);
                                        });
                                } catch (err) {
                                    console.log(err);
                                } finally {
                                    /* submit form */
                                    alert(category.charAt(0).toUpperCase() + category.slice(1) + " saved!");
                                    window.location.href = url;
                                };
                            } else {
                                /* send the data to the db */
                                try {
                                    /* send the file new content to the server */
                                    var contentFile = tinymce.get("fileBaseTxt").getContent();
                                    data = {
                                        idEdition: idEdition,
                                        idEditor: idEditor,
                                        contentFile: contentFile
                                    }
                                } catch (err) {
                                    console.log(err);
                                } finally {
                                    const saveEdition = new Promise((resolve, reject) => {
                                        saveFile(data, (err, result) => {
                                            if (err) {
                                                console.log("Error in saveFile:", err);
                                                reject(err);
                                            } else {
                                                console.log("Result from saveFile:", result);
                                                resolve(result);
                                            }
                                        });
                                    });

                                    saveEdition
                                        .then(() => {
                                            alert(category.charAt(0).toUpperCase() + category.slice(1) + " saved!");
                                            window.location.href = url;
                                        })
                                        .catch(error => {
                                            console.error("Error saving file: ", error);
                                        });
                                };
                            };

                            /* unblock all the buttons */
                            const btns = document.querySelectorAll(".btn-set-annotation button");
                            for (var i = 0; i < btns.length; i++) {
                                btns[i].removeAttribute("disabled");
                            };
                        };
                    });

                } else {

                    /* unblock all the buttons */
                    const btns = document.querySelectorAll(".btn-set-annotation button");
                    for (var i = 0; i < btns.length; i++) {
                        btns[i].removeAttribute("disabled");
                    };

                    /* show default settings */
                    var formToHide = document.querySelector(".annotation-form." + category);
                    formToHide.classList.add("d-none");
                    document.querySelector(".default-settings").classList.remove("d-none");
                    /* warning that you have selected nothing */
                    document.getElementById("annotation-warning").innerHTML = '<div class="alert alert-warning fade show" role="alert"><p><b>No selected fragment</b>. Highlight the fragment in the text you want to annotate, then click.</p></div>'
                };

            };

        });

    });
};

/* preview annotations */
export const previewAnnotations = () => {
    var btnPreview = document.querySelectorAll(".btn-preview");
    btnPreview.forEach((btn) => {
        btn.addEventListener("click", () => {

            /* close annotations */
            closeAnnotationBox();

            /* open panels */
            /* vertical panels */
            var bigger = btn.closest(".enlarge-col");
            if (bigger !== null) {
                var toHide = document.querySelector(".annotations-box-below");
                toHide.classList.add("d-none");
                toHide.classList.remove("d-block");
                bigger.classList.remove("col-md-1");
                bigger.classList.add("col-md-4");
                bigger.classList.add("bg-light");
                /* hide the button to add annotations */
                btn.classList.add("top-btn");
                btn.classList.add("d-none");
                btn.classList.remove("d-block");
                /* hide the close button */
                bigger.querySelector(".btn-close").classList.remove("d-none");
            } else {
                /* below annotations resize */
                var smaller = document.querySelectorAll(".col-md-4.enlarge-col");
                var toShow = document.querySelector(".annotations-box-below");
                toShow.classList.add("d-block");
                toShow.classList.remove("d-none");
                if (smaller.length > 0) {
                    smaller.forEach((el) => {
                        el.classList.add("col-md-1");
                        el.classList.remove("col-md-4");
                        el.classList.remove("bg-light");
                        /* hide the button to add annotations */
                        el.querySelector(".top-btn").classList.remove("d-none");
                    });
                };
            };

            /* SHOW THE FORMS */
            /* selected fragment form */
            var category = btn.getAttribute("data-value");

            /* show the preview */
            var formToShow = document.querySelector(".annotation-form." + category);
            formToShow.classList.remove("d-none");
            var someTabTriggerEl = formToShow.querySelector("button[data-bs-target='#check-" + category + "']")
            var tab = new bootstrap.Tab(someTabTriggerEl);
            tab.show();

            /* hide other preview */
            var formsToHide = document.querySelectorAll(".annotation-form:not(." + category + ")");
            formsToHide.forEach((form) => {
                form.classList.add("d-none");
            });

            /* block all the buttons */
            const btns = document.querySelectorAll(".btn-set-annotation button");
            btns.forEach((el) => {
                el.setAttribute("disabled", "disabled");
            });

            /* check selected fragment */
            checkSelectedFragment();

        });
    });
};

/* modify annotations */
export const modifyAnnotations = () => {
    var modifyBtn = document.querySelectorAll(".modify-btn");
    modifyBtn.forEach((btn) => {
        btn.addEventListener("click", () => {
            var type = btn.getAttribute("data-type");
            var form = document.getElementById(type + "-req");
            var dataContainer = btn.closest(".container-" + type);
            var data = dataContainer.querySelectorAll("[data-name]");

            /* hide the alert */
            var formAlerts = document.querySelectorAll(".annotation-form:not(.d-none)");
            formAlerts.forEach((alertMsg) => {
                alertMsg.querySelector(".alert-warning").classList.add("d-none");
            });

            /* show the form */
            form.classList.remove("d-none");

            /* modify annotation */
            /* init textareas */
            var selector = "." + type + "-container textarea";
            tinymce.init({
                selector: selector,
                resize: "both",
                width: "100%",
                plugins: "preview searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime lists wordcount help charmap quickbars",
                menubar: "file edit view insert format tools table help",
                toolbar: "undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap | fullscreen preview save | image media template link anchor codesample | ltr rtl",
                toolbar_sticky: false,
                autosave_ask_before_unload: true,
                autosave_interval: "30s",
                autosave_prefix: "{path}{query}-{id}-",
                autosave_restore_when_empty: false,
                autosave_retention: "2m",
                image_advtab: true,
                template_cdate_format: "[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]",
                template_mdate_format: "[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]",
                height: "50vh",
                image_caption: true,
                quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
                toolbar_mode: "sliding",
                contextmenu: "link image table"
            });

            /* click on the annotate tab */
            let clickTab = () => {
                var tab = document.querySelector("[data-bs-target='#annotate-" + type + "']");
                tab.click();
            };

            /* clone variant containers */
            let cloneVariantContainers = () => {
                var variants = dataContainer.querySelectorAll("[data-subtype='variant']");
                for (var i = 0; i < variants.length; i++) {
                    form.querySelector("[data-clone='variant']").click();
                };
            };

            /* show the correct category form */
            let showForm = () => {
                var forms = document.querySelectorAll(".annotation-form." + type);
                forms.forEach((form) => {
                    form.classList.remove("d-none");
                    /* empty all the inputs but the checkbox */
                    var inputs = form.querySelectorAll("input:not([type='checkbox'])");
                    inputs.forEach((input) => {
                        input.value = "";
                    });
                });
            };

            /* input to fill in */
            let fillIn = () => {
                data.forEach((el) => {

                    var name = el.getAttribute("data-name");
                    var val = el.getAttribute("data-fill");

                    /* types of input */
                    /* numbers */
                    let numbers = () => {
                        var numbers = form.querySelectorAll("[type='number'][name='" + name + "']");
                        numbers.forEach((number) => {
                            /* fill the number */
                            number.value = val;

                            /* live check */
                            if (type == "apparatus" && el.getAttribute("data-name") !== "chapter") {
                                document.getElementById("live-" + name).innerHTML = val;
                            };
                        });
                    };

                    /* texts */
                    let texts = () => {
                        var texts = form.querySelectorAll("[type='text'][name='" + name + "']");
                        texts.forEach((text) => {
                            /* fill the text */
                            text.value = val;

                            /* live check */
                            if (type == "apparatus") {
                                if (document.getElementById("live-" + name) !== null) {
                                    document.getElementById("live-" + name).innerHTML = val;
                                };
                            };
                        });
                    };

                    /* checkbox */
                    let checkbox = () => {
                        var arr = [];
                        var checkboxes = form.querySelectorAll("[type='checkbox'][name='" + name + "']");
                        checkboxes.forEach((checkbox) => {
                            /* uncheck */
                            checkbox.checked = false;
                            /* check */
                            var values = val.split(",");
                            values.forEach((v) => {
                                /* check the checkbox */
                                if (checkbox.getAttribute("value") == v) {
                                    checkbox.checked = true;
                                };
                                /* fill the array for the live check */
                                if (arr.includes(v) == false) {
                                    arr.push(v);
                                };
                            });
                        });
                        /* live check */
                        if (type == "apparatus") {
                            document.getElementById("live-" + name).innerHTML = arr.join("");
                        };
                    };

                    /* lists */
                    let lists = () => {
                        var lists = form.querySelectorAll("[data-list][name='" + name + "']");
                        lists.forEach((list) => {

                            /* fill the list */
                            list.value = val;

                            /* live check */
                            if (type == "apparatus") {
                                var vals = [];
                                vals.push(val);
                                document.getElementById("live-" + name).innerHTML = val.replace(" ; ", " ");
                            };
                        });
                    };

                    /* textareas */
                    let textareas = () => {
                        var textareas = form.querySelectorAll("textarea[name='" + name + "']");
                        textareas.forEach((textarea) => {

                            /* fill the textarea */
                            let printTxt = () => {
                                tinyMCE.get(textarea.id).setContent(val);
                            };
                            setTimeout(printTxt, 3000);

                            /* live check */
                            if (type == "apparatus") {
                                var idTextarea = name.split("Omission")[0];
                                if (idTextarea.indexOf("Notes") > -1) {
                                    idTextarea = name.split("Notes")[0];
                                    document.getElementById("live-" + idTextarea + "-OmissionEditor").innerHTML = val;
                                } else {
                                    document.getElementById("live-" + idTextarea + "-OmissionEditor").innerHTML = val;
                                };
                            };
                        });
                    };

                    /* fill the input */
                    if (el.getAttribute("data-input") == "number") {
                        numbers();
                    } else if (el.getAttribute("data-input") == "text") {
                        texts();
                    } else if (el.getAttribute("data-input") == "checkbox") {
                        checkbox();
                    } else if (el.getAttribute("data-input") == "list") {
                        lists();
                    } else {
                        textareas();
                    };

                });
            };

            /* remove empty clones */
            let removeEmptyClones = () => {
                var emptyClones = form.querySelectorAll(".cloned-el[data-cloned='variant']");

                var emptyClones = form.querySelectorAll(".cloned-el[data-cloned='variant']");
                for (var i = 0; i < emptyClones.length; i++) {
                    if (emptyClones[i].querySelector("input[data-subtype='id-variant']").value == "") {
                        emptyClones[i].classList.add("d-none");
                    } else {
                        emptyClones[i].classList.remove("d-none");
                    };
                };
            };

            /* run all the functions */
            clickTab();
            cloneVariantContainers();
            showForm();
            fillIn();
            removeEmptyClones();
        });
    });
};

/* hide annotations */
export const hideAnnotations = () => {
    var btnHide = document.querySelectorAll(".btn-hide");
    btnHide.forEach((btn) => {
        btn.addEventListener("click", () => {
            /* change icon btn */
            btn.querySelector(".icon-show").classList.toggle("d-none");
            btn.querySelector(".icon-hide").classList.toggle("d-none");

            /* hide annotation */
            var categoryToHide = btn.getAttribute("data-value");
            var spansToHide = tinyMCE.get("fileBaseTxt").dom.select("span[data-type='annotation-object'][data-subtype='" + categoryToHide + "']");
            if (spansToHide) {
                spansToHide.forEach((span) => {
                    span.classList.toggle("hidden-annotation");
                });
            };
        });
    });
};

/* delete annotation */
const deleteAnnotationModal = () => {
    /* modal */
    var modals = document.querySelectorAll("div[data-role='cancel-annotation']");
    modals.forEach((modal) => {
        var safeDeletionInput = modal.querySelector("input[data-role='safe-deletion']");
        var saveChangesBtn = modal.querySelector("button[data-role='safe-deletion-btn']");
        /* open the modal */
        modal.addEventListener("shown.bs.modal", () => {
            /* delete forever */
            if (modal.classList.contains("delete-modal")) {
                /* typing in the input */
                safeDeletionInput.addEventListener("keyup", () => {
                    /* check the value of the input */
                    if (safeDeletionInput.value == "delete-annotation") {
                        saveChangesBtn.removeAttribute("disabled");
                    } else {
                        /* disable the save changes button */
                        saveChangesBtn.setAttribute("disabled", "disabled");
                    };
                });
            } else {
                /* only close the panel interrupting the filling in the form */
                saveChangesBtn.removeAttribute("disabled");
            };

            /* save changes */
            saveChangesBtn.addEventListener("click", async () => {
                var id = saveChangesBtn.getAttribute("data-cancel");

                /* CANCEL THE ANNOTATION */
                let cancelAnnotationColor = () => {
                    return new Promise((resolve) => {
                        /* button to cancel */
                        var safeCancelBtn;

                        if (id) {
                            safeCancelBtn = document.querySelector("button[data-type='cancel-annotation'][data-cancel='" + id + "']");
                        } else {
                            safeCancelBtn = document.querySelector("button[data-type='cancel-annotation']");
                        }

                        var annotationId = safeCancelBtn.getAttribute("data-cancel");

                        /* search all elements with the annotation id */
                        var annotationDiv = tinymce.get("fileBaseTxt").dom.select('span[data-annotation="' + annotationId + '"]');

                        /* reinsert the original content without annotation tags */
                        var newContent = "";
                        annotationDiv.forEach((annotation) => {
                            /* remove milestones */
                            if (annotation.getAttribute("data-type") == "milestone") {
                                annotation.remove();
                            } else {
                                /* remove annotations */
                                var annotationChildren = annotation.childNodes;
                                annotationChildren.forEach((el) => {
                                    if (el.tagName == "SPAN") {
                                        // do nothing
                                    } else if (el.tagName == "P") {
                                        newContent = newContent + el.outerHTML;
                                    } else {
                                        var txt = el.textContent;
                                        annotation.outerHTML = "" + txt;
                                        newContent = "";
                                    };
                                });
                                if (newContent !== "") {
                                    annotation.outerHTML = newContent;
                                };
                            };
                        });
                        saveFile();
                        resolve();
                    });
                };

                /* close the modal */
                let closeModal = () => {
                    return new Promise((resolve) => {
                        let modalToClose = bootstrap.Modal.getInstance(modal);
                        modalToClose.hide();
                        resolve();
                    });
                };

                /* reset the layout */
                let resetLayout = () => {
                    return new Promise((resolve) => {
                        closeAnnotationBox();
                        var defaultSettings = document.querySelector(".default-settings");
                        defaultSettings.classList.remove("d-none");
                        resolve();
                    });
                };

                /* unblock the annotation buttons */
                let unblockButtons = () => {
                    return new Promise((resolve) => {
                        const btns = document.querySelectorAll(".btn-set-annotation button");
                        for (var i = 0; i < btns.length; i++) {
                            btns[i].removeAttribute("disabled");
                        };
                        resolve();
                    });
                };

                /* when the modal is closed / empty inputs */
                let emptyInputs = () => {
                    return new Promise((resolve) => {
                        modal.addEventListener("hidden.bs.modal", () => {
                            /* disable the button to delete the annotation */
                            saveChangesBtn.setAttribute("disabled", "disabled");
                            /* empty the input */
                            safeDeletionInput.value = "";
                            resolve();
                        });
                    });
                };

                if (saveChangesBtn.classList.contains("btn-delete")) {
                    /* delete the annotation from the db */
                    /* data to delete */
                    var nodeID = saveChangesBtn.getAttribute("data-node-id");
                    if (nodeID) {
                        /* data to send to the post function in the backend */
                        var data = {
                            nodeID: nodeID
                        };
                        var editionID = window.location.href.split("/").pop().split("-")[0];
                        var editorID = window.location.href.split("/").pop().split("-")[1];
                        var url;

                        /* call the post function to delete the entity */
                        try {
                            let fetchDelete = async () => {
                                const response = await fetch("/delete/" + editionID + "-" + editorID, {
                                    method: "POST",
                                    headers: { "Content-type": "application/json; charset=UTF-8" },
                                    body: JSON.stringify(data)
                                });

                                if (!response.ok) {
                                    throw new Error("Can't call post to delete data");
                                };

                                const responseData = await response.json();
                                return responseData["url"];
                            };

                            /* DELETE THE ANNOTATION */
                            /* redirect the page */
                            url = await fetchDelete();
                            console.log("Fetch fatta, adesso devi togliere il colore");

                            await cancelAnnotationColor();
                            await closeModal();
                            await resetLayout();
                            await unblockButtons();
                            await emptyInputs();

                            if (url) {
                                url = url.replace("delete", "edit");
                                window.location.href = url;
                            } else {
                                console.error("URL is not defined");
                            };
                        } catch (err) {
                            console.error(err);
                        };
                    };
                } else {
                    /* DELETE THE ANNOTATION */
                    await cancelAnnotationColor();
                    await closeModal();
                    await resetLayout();
                    await unblockButtons();
                    await emptyInputs();
                };
            });
        });
    });
};

/* close annotation box when clicking on another annotation button */
const closeAnnotationBox = () => {
    /* reset the empty annotation box */
    var defaultAnnotationBox = document.querySelector(".annotations-box-below");
    defaultAnnotationBox.classList.remove("d-none");
    defaultAnnotationBox.classList.add("d-block");

    /* hide default settings */
    var defaultSettings = document.querySelector(".default-settings");
    defaultSettings.classList.add("d-none");

    /* annotation box > default col */
    var smaller = document.querySelectorAll(".col-md-4.enlarge-col");
    if (smaller.length > 0) {
        if (smaller.length > 0) {
            smaller.forEach((el) => {
                /* reset the col */
                el.classList.add("col-md-1");
                el.classList.remove("col-md-4");
                el.classList.remove("bg-light");
                el.querySelector(".top-btn").classList.remove("d-none");

                /* hide the forms */
                el.querySelector(".annotation-form").classList.add("d-none");

                /* hide the close button */
                el.querySelector(".btn-close").classList.add("d-none");
            });
        };
    } else {
        /* hide the forms */
        var annotationBoxes = document.querySelectorAll(".annotation-form");
        annotationBoxes.forEach((box) => {
            box.classList.add("d-none");
        });
    };
};

/* close annotation box when clicking on another annotation button */
export const closeBtn = () => {
    var closeBtn = document.querySelectorAll(".btn-close-annotation");
    closeBtn.forEach((btn) => {
        btn.addEventListener("click", () => {
            /* add/remove to the modal the delete class / to understand to delete or not the annotation */
            if (btn.classList.contains("btn-delete") == true) {
                var modalRef = btn.getAttribute("data-bs-target").replace("#", "");
                var modal = document.getElementById(modalRef);
                var annotationType = btn.getAttribute("data-annotation-type");
                /* assign attributes to delete the annotation */
                modal.classList.add("delete-annotation");
                modal.setAttribute("data-annotation-type", annotationType);
            } else {
                var modalRef = btn.getAttribute("data-bs-target").replace("#", "");
                var modal = document.getElementById(modalRef);
                if (modal.classList.contains("delete-annotation") == true) {
                    modal.classList.remove("delete-annotation");
                    modal.removeAttribute("data-annotation-type");
                };
            };

            /* remove highlight in the text */
            deleteAnnotationModal();
        });
    });
};

/* check selected fragment */
const checkSelectedFragment = () => {
    var form = document.querySelector(".annotation-form:not(.d-none)");
    var annotate = form.querySelector(".tab-pane[aria-labelledby='annotate-tab'] .form-annotations");
    var alert = form.querySelector(".alert-warning");
    var fragment = form.querySelector("input[name='selectedFragment']");

    /* if no selected fragment hide the form and show alert / vice versa */
    if (fragment.value == "") {
        annotate.classList.add("d-none");
        alert.classList.remove("d-none");
    } else {
        annotate.classList.remove("d-none");
        alert.classList.add("d-none");
    };
};

/* show selected fragment form */
const showSelectedFragmentForm = () => {
    var form = document.querySelector(".annotation-form:not(.d-none)");
    var annotate = form.querySelector(".tab-pane[aria-labelledby='annotate-tab'] .form-annotations");
    var alert = form.querySelector(".alert-warning");
    var fragment = form.querySelector("input[name='selectedFragment']");

    /* if no selected fragment hide the form and show alert / vice versa */
    annotate.classList.remove("d-none");
    alert.classList.add("d-none");
};

/* live check */
/* textarea live check in textarea() */
const liveCheck = () => {
    var input = document.querySelectorAll(".live-check");
    var stanzaStartInput;
    var stanzaEndInput;
    var padaStart = [];
    var padaEnd = [];

    input.forEach((el) => {
        "change keyup".split(" ").forEach((e) => {
            el.addEventListener(e, () => {
                /* RADIOS */
                if (el.getAttribute("type") == "radio") {
                    var radiosParents = el.parentNode.querySelectorAll(".form-check");
                    radiosParents.forEach((radioParent) => {
                        var radios = radioParent.querySelectorAll("[type='radio']");
                        radios.forEach((radio) => {
                            radio.addEventListener("change", () => {
                                /* truncation */
                                document.getElementById("live-" + el.getAttribute("name")).innerHTML = el.value;
                            });
                        });
                    });
                };

                /* NUMBER */
                if (el.getAttribute("type") == "number") {

                    /* stanza start */
                    if (el.getAttribute("name") == "stanzaStart") {
                        /* value of stanza start to reuse to handle padas */
                        stanzaStartInput = el.value;
                        /* print value of stanza */
                        document.getElementById("live-stanzaStart").innerHTML = el.value;
                    };

                    /* stanza end */
                    if (el.getAttribute("name") == "stanzaEnd") {

                        /* value of stanza end to reuse to handle padas */
                        stanzaEndInput = el.value;

                        if (el.value !== "") {
                            var stanzaStart = document.getElementById("live-stanzaStart").innerHTML;
                            if (stanzaStart !== el.value) {
                                /* print value of stanza */
                                document.getElementById("live-stanzaEnd").innerHTML = el.value;
                                /* add dash */
                                document.getElementById("stanza-dash").classList.remove("d-none");
                            } else {
                                /* print value of stanza */
                                document.getElementById("live-stanzaEnd").innerHTML = "";
                                /* remove dash */
                                document.getElementById("stanza-dash").classList.add("d-none");
                            };

                        } else {
                            /* print value of stanza */
                            document.getElementById("live-stanzaEnd").innerHTML = "";
                            /* remove dash */
                            document.getElementById("stanza-dash").classList.add("d-none");
                        };
                    };

                };

                /* TEXT */
                if (el.getAttribute("type") == "text") {
                    /* print value of lemma and variants */
                    document.getElementById("live-" + el.getAttribute("name")).innerHTML = el.value;

                    /* lemma */
                    if (el.getAttribute("name") == "lemma") {
                        /* bracket */
                        document.getElementById("lemma-bracket").classList.remove("d-none");
                    };
                };

                /* CHECKBOX */
                if (el.getAttribute("type") == "checkbox") {
                    /* if the stanzas are the same */
                    if (stanzaStartInput !== stanzaEndInput) {
                        /* pada start */
                        if (el.getAttribute("name") == "padaStart") {
                            /* add value */
                            if (el.checked === true) {
                                if (padaStart.includes(el.value) === false) {
                                    padaStart.push(el.value);
                                };
                            } else {
                                /* remove value */
                                if (padaStart.includes(el.value) === true) {
                                    var index = padaStart.indexOf(el.value);
                                    if (index !== -1) {
                                        padaStart.splice(index, 1);
                                    };
                                };
                            };
                            /* print value of pada start */
                            document.getElementById("live-padaStart").innerHTML = JSON.stringify(padaStart).replace(/[[\]]/g, '').replace(/"/g, "").replace(/,/g, "");

                        } else {
                            /* pada end */
                            /* add value */
                            if (el.checked === true) {
                                if (padaEnd.includes(el.value) === false) {
                                    padaEnd.push(el.value);
                                };
                            } else {
                                /* remove value */
                                if (padaEnd.includes(el.value) === true) {
                                    var index = padaEnd.indexOf(el.value);
                                    if (index !== -1) {
                                        padaEnd.splice(index, 1);
                                    };
                                };
                            };
                            /* print value of pada end */
                            document.getElementById("live-padaEnd").innerHTML = JSON.stringify(padaEnd).replace(/[[\]]/g, '').replace(/"/g, "").replace(/,/g, "");
                        };
                    } else {
                        /* pada start */
                        if (el.getAttribute("name") == "padaStart") {
                            /* add value */
                            if (el.checked === true) {
                                if (padaStart.includes(el.value) === false) {
                                    padaStart.push(el.value);
                                };
                            } else {
                                /* remove value */
                                if (padaStart.includes(el.value) === true) {
                                    var index = padaStart.indexOf(el.value);
                                    if (index !== -1) {
                                        padaStart.splice(index, 1);
                                    };
                                };
                            };
                            /* print value of pada start */
                            document.getElementById("live-padaStart").innerHTML = JSON.stringify(padaStart).replace(/[[\]]/g, '').replace(/"/g, "").replace(/,/g, "");
                        };

                        /* pada end */
                        document.getElementById("live-padaEnd").innerHTML = "";
                    };
                };

                /* DATALIST */
                if (el.getAttribute("type") == "search") {
                    document.getElementById("live-" + el.getAttribute("name")).innerHTML = el.value.replace(/[;]/g, " ");
                };
            });
        });
    });

    liveCheckAutocomplete();
};

/* live check presence */
const liveCheckPresence = () => {
    /* present / omission radios */
    var presenceRadios = document.querySelectorAll(".check-presence");
    presenceRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            var liveCheck = document.getElementById("live-" + radio.getAttribute("data-omission"));
            if (radio.getAttribute("data-value").indexOf("omission") > -1) {
                /* empty the input of the omitted lemma / variant */
                var omittedInput = document.querySelector("[name='" + radio.getAttribute("data-omission") + "']");
                omittedInput.value = "";
                /* print om. in live check */
                liveCheck.innerHTML = "om.";
                document.getElementById("lemma-bracket").classList.add("d-none");
            } else {
                /* empty the live check */
                liveCheck.innerHTML = "";
            };
        });
    });
};

/* live check autocomplete */
const liveCheckAutocomplete = () => {
    var list = document.querySelectorAll(".results_list");
    list.forEach((el) => {
        el.addEventListener("click", () => {
            var id = el.getAttribute("id");
            var input = document.querySelector("[aria-controls='" + id + "']");
            var val = input.value;
            document.getElementById("live-" + input.getAttribute("name")).innerHTML = val.replace(/[;]/g, " ");
        });
    });
};