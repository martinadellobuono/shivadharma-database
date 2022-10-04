document.addEventListener("DOMContentLoaded", () => {
    alerts();
    popovers();
    textarea();
    autocomplete();
    cloneEl();
    annotations();
    cancelAnnotations();
    closeBtn();
    liveCheck();
    checkAnnotatedFragments();
});

/* alerts */
let alerts = () => {
    let showAlert = () => {
        [].forEach.call(document.querySelectorAll(".alert"), (el) => {
            el.classList.add("show");
        });
    };
    setTimeout(showAlert, 300);
};

/* popovers */
let popovers = () => {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })
};

/* textarea */
let textarea = () => {
    var useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    tinymce.init({
        selector: ".textarea-container textarea",
        resize: false,
        width: "100%",
        plugins: "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons",
        menubar: "file edit view insert format tools table help",
        toolbar: "undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl",
        toolbar_sticky: true,
        autosave_ask_before_unload: true,
        autosave_interval: "30s",
        autosave_prefix: "{path}{query}-{id}-",
        autosave_restore_when_empty: false,
        autosave_retention: "2m",
        image_advtab: true,
        link_list: [
            { title: "My page 1", value: "https://www.tiny.cloud" },
            { title: "My page 2", value: "http://www.moxiecode.com" }
        ],
        image_list: [
            { title: "My page 1", value: "https://www.tiny.cloud" },
            { title: "My page 2", value: "http://www.moxiecode.com" }
        ],
        image_class_list: [
            { title: "None", value: "" },
            { title: "Some class", value: "class-name" }
        ],
        importcss_append: true,
        file_picker_callback: function (callback, value, meta) {
            /* Provide file and text for the link dialog */
            if (meta.filetype === "file") {
                callback("https://www.google.com/logos/google.jpg", { text: "My text" });
            };
            /* Provide image and alt text for the image dialog */
            if (meta.filetype === "image") {
                callback("https://www.google.com/logos/google.jpg", { alt: "My alt text" });
            };
            /* Provide alternative source and posted for the media dialog */
            if (meta.filetype === "media") {
                callback("movie.mp4", { source2: "alt.ogg", poster: "https://www.google.com/logos/google.jpg" });
            };
        },
        templates: [
            { title: "New Table", description: "creates a new table", content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>' },
            { title: "Starting my story", description: "A cure for writers block", content: "Once upon a time..." },
            { title: "New list with dates", description: "New List with dates", content: '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>' }
        ],
        template_cdate_format: "[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]",
        template_mdate_format: "[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]",
        height: "65vh",
        image_caption: true,
        quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
        noneditable_noneditable_class: "mceNonEditable",
        toolbar_mode: "sliding",
        contextmenu: "link image table",
        skin: useDarkMode ? "oxide-dark" : "oxide",
        content_css: useDarkMode ? "dark" : "default",
        content_style: "body {font-family:Helvetica,Arial,sans-serif; font-size:16px}" +
            "[data-type='milestone'][data-start='start']::before {content: '\u270E';}" +
            "[data-type='annotation-object'] {display: inline;}" +
            "[data-type='annotation-object'][data-subtype='apparatus'] {text-decoration: underline 3px solid #FFC107; text-underline-offset: 3px;}" +
            "[data-type='annotation-object'][data-subtype='translation'] {text-decoration: underline 3px solid #79DFC1; text-underline-offset: 6px;}",
        verify_html: false,

        /* CHECK THE ANNOTATED FRAGMENTS */
        setup: (ed) => {

            /* MOUSEDOWN */
            ed.on("mousedown", (e) => {

                /* open the modal */
                var annotation = e.target.closest("[data-type='annotation-object']");
                var annotationId = annotation.getAttribute("data-annotation");

                if (annotation !== null) {
                    var modalContainer = document.querySelector("#check-modifications");
                    var modal = bootstrap.Modal.getOrCreateInstance(modalContainer);
                    modal.show();

                    /* ADD A NEW ANNOTATION */
                    var addAnnotation = modalContainer.querySelector("[data-role='add-annotation']");
                    addAnnotation.addEventListener("click", () => {

                        /* close the modal */
                        modal.hide();
                        var allowOpenModal = false;
                        modalContainer.addEventListener("show.bs.modal", (e) => {
                            if (!allowOpenModal) {
                                e.preventDefault();
                                modal.hide();
                                allowOpenModal = true;
                            };
                        });

                        /* click in the textarea again */
                        ed.on("mousedown", (e) => {
                            var el = e.target.closest("[data-type='annotation-object']");
                            var elId = el.getAttribute("data-annotation");

                            /* click not on the previously clicked element */
                            if (annotationId !== elId) {
                                allowOpenModal = true;
                                modal.show();
                                annotationId = elId;
                                allowOpenModal = false;
                            } else {
                                /* click on the previously clicked element */
                                allowOpenModal = false;
                                modalContainer.addEventListener("show.bs.modal", (e) => {
                                    if (!allowOpenModal) {
                                        e.preventDefault();
                                        modal.hide();
                                    };
                                });
                            };

                        });

                    });


                };
            });

        }

    });
};

/* autocomplete */
let autocomplete = () => {
    var i = 0;
    [].forEach.call(document.querySelectorAll("[data-list]:not(.no-autocomplete-duplicates)"), (el) => {
        /* remove duplicates */
        el.classList.add("no-autocomplete-duplicates");
        /* create the autocomplete */
        var dataType = el.getAttribute("data-type");
        var dataList = el.getAttribute("data-list");
        var idList = el.getAttribute("id");
        var jsonList = JSON.parse(dataList);
        const autoCompleteJS = new autoComplete({
            selector: "#" + idList,
            placeHolder: "Search for " + dataType + "...",
            data: {
                src: jsonList,
                cache: true
            },
            resultsList: {
                id: "autoComplete_list_" + i,
                class: "results_list",
                element: (list, data) => {
                    // no results
                    if (!data.results.length) {
                        // no results message element
                        const message = document.createElement("div");
                        // add class to the created element
                        message.setAttribute("class", "no_result");
                        // add message text content
                        message.innerHTML = `<span>Found no results for "${data.query}".<br><span class="fw-bold">Insert it in the metadata.</span></span>`;
                        // append message element to the results list
                        list.prepend(message);
                    };
                },
                noResults: true,
            },
            resultItem: {
                highlight: true
            },
            query: (query) => {
                // split query into array
                const querySplit = query.split("|");
                // get last query value index
                const lastQuery = querySplit.length - 1;
                // trim new query
                const newQuery = querySplit[lastQuery].trim();
                return newQuery;
            },
            events: {
                input: {
                    focus: (event) => {
                        //autoCompleteJS.open(jsonList);
                    },
                    selection(event) {
                        const feedback = event.detail;
                        const input = autoCompleteJS.input;
                        // trim selected value
                        const selection = feedback.selection.value.trim();
                        // split query into array and trim each value
                        const query = input.value.split("|").map(item => item.trim());
                        // remove last query
                        query.pop();
                        // add selected value
                        query.push(selection);
                        // replace input value with the new query
                        input.value = query.join(" | ") + " | ";
                    }
                }
            }
        });
        i++;
    });
};

/* clone elements */
let cloneEl = () => {
    var i = 1;
    [].forEach.call(document.querySelectorAll("[data-clone]"), (el) => {
        el.addEventListener("click", () => {
            var cloneVal = el.getAttribute("data-clone");
            var toClone = document.querySelectorAll("[data-cloned='" + cloneVal + "']");
            /* clone the element */
            var cloned = toClone[0].cloneNode(true);
            /* add the close button */
            var closeDiv = document.createElement("span");
            closeDiv.className = "add-close";
            closeDiv.innerHTML = `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
            cloned.insertBefore(closeDiv, cloned.firstChild);
            /* empty the forms */
            var forms = cloned.querySelectorAll("input");
            forms.forEach((el) => {
                el.value = "";
            });
            /* change the id of the autocomplete cloned */
            var idToClone = cloned.querySelectorAll("[data-list]")[0].getAttribute("id");
            cloned.querySelectorAll("[data-list]")[0].id = idToClone + "-" + i;
            /* change the name of the cloned input */
            cloned.querySelector("input[name='variant0']").setAttribute("name", "variant" + i);
            cloned.querySelector("input[name='manuscriptVariant0']").setAttribute("name", "manuscriptVariant" + i);
            /* print the clone */
            var appendClone = document.getElementById(cloneVal);
            appendClone.appendChild(cloned);
            /* assign a specific class */
            cloned.classList.add("cloned-el");
            /* clone live check */
            var toCloneLiveCheck = document.getElementById("live-clone-" + el.getAttribute("data-clone"));
            var clonedLiveCheck = toCloneLiveCheck.cloneNode(true);
            document.getElementById("add-live-clone-" + el.getAttribute("data-clone")).appendChild(clonedLiveCheck);
            /* assign a specific id */
            cloned.id = cloneVal + "-" + i;
            clonedLiveCheck.setAttribute("data-ref", cloneVal + "-" + i);
            /* empty the live check spans */
            var formsLiveCheck = clonedLiveCheck.querySelectorAll("span");
            formsLiveCheck.forEach((el) => {
                el.innerHTML = "";
            });
            /* i */
            i++;
            /* remove duplicates */
            cloned.querySelectorAll("[data-list]")[0].classList.remove("no-autocomplete-duplicates");
            /* autocomplete */
            autocomplete();
            /* live check */
            liveCheckCloned();
        });
    });
};

/* annotations */
let annotations = () => {

    /* n to create an id for the annotations */
    var n = 0;

    [].forEach.call(document.querySelectorAll(".btn-annotation"), (el) => {

        /* annotation type */
        var annType = el.getAttribute("data-value");

        /* CLICK ON THE BUTTON TO ADD ANNOTATIONS */
        el.addEventListener("click", () => {

            /* get selected text */
            if (document.getSelection) {
                if (tinymce.activeEditor.selection.getContent() !== "") {

                    /* OPEN THE BOX */
                    /* close the open box */
                    closeAnnotationBox();
                    /* top annotations resize */
                    if (el.parentNode.classList.contains("enlarge-col") === true) {
                        var bigger = el.parentNode;
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

                    /* SHOW THE FORMS */
                    /* selected fragment form */
                    var category = el.getAttribute("data-value");
                    document.querySelector("[name='selectedFragment'][data-value='" + category + "']").value = tinymce.activeEditor.selection.getContent({ format: "text" }).trim();
                    /* hide the non clicked form */
                    var forms = document.querySelectorAll(".annotation-form");
                    forms.forEach((el) => {
                        /* show the clicked form */
                        if (el.classList.contains(category) === true) {
                            el.classList.remove("d-none");
                        } else {
                            /* hide the clicked form */
                            el.classList.add("d-none");
                        };
                    });

                    /* PRINT MILESTONES AND CONTENT IN THE TEXT */
                    /* selected string */
                    var sel = tinymce.activeEditor.selection;

                    /* selected range */
                    var rng = sel.getRng();

                    /* n to create an id for the annotations */
                    n += 1;

                    /* create the start milestone */
                    var milestoneStart = document.createElement("span");
                    milestoneStart.setAttribute("data-type", "milestone");
                    milestoneStart.setAttribute("data-subtype", annType);
                    milestoneStart.setAttribute("data-start", "start");
                    /* assign an id to the annotation */
                    milestoneStart.setAttribute("data-annotation", "annotation-" + n);
                    /* / */

                    /* create the end milestone */
                    var milestoneEnd = document.createElement("span");
                    milestoneEnd.setAttribute("data-type", "milestone");
                    milestoneEnd.setAttribute("data-subtype", annType);
                    milestoneEnd.setAttribute("data-end", "end");
                    /* assign an id to the annotation */
                    milestoneEnd.setAttribute("data-annotation", "annotation-" + n);
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
                    startAnnotation.setAttribute("data-annotation", "annotation-" + n);
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
                    endAnnotation.setAttribute("data-annotation", "annotation-" + n);
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
                                annotation.setAttribute("data-annotation", "annotation-" + n);
                                /* / */
                                startParent.innerHTML = annotation.outerHTML;
                            } else {
                                return false;
                            };
                        };
                    };
                    // /

                    /* CANCEL BUTTON */
                    /* assign the same id to the cancel button */
                    var annotationForm = document.querySelector(".annotation-form:not(.d-none)");
                    var safeCancelBtn = annotationForm.querySelector("button[data-type='cancel-annotation']");
                    safeCancelBtn.setAttribute("data-cancel", "annotation-" + n);

                } else {
                    document.getElementById("annotation-warning").innerHTML = '<div class="alert alert-warning alert-dismissible fade show" role="alert"><p>Highlight the fragment in the text you want to annotate, then click.</p><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
                };

            };
        });

    });
};

/* cancel annotations */
let cancelAnnotations = () => {

    /* modal */
    var modals = document.querySelectorAll("div[data-role='cancel-annotation']");
    modals.forEach((modal) => {
        var safeDeletionInput = modal.querySelector("input[data-role='safe-deletion']");
        var saveChangesBtn = modal.querySelector("button[data-role='safe-deletion-btn']");
        /* open the modal */
        modal.addEventListener("shown.bs.modal", () => {
            /* typing in the input */
            safeDeletionInput.addEventListener("keyup", () => {
                /* check the value of the input */
                if (safeDeletionInput.value == "martinadellobuono") {
                    /* enable the save changes button */
                    saveChangesBtn.removeAttribute("disabled");
                    /* save changes */
                    saveChangesBtn.addEventListener("click", () => {

                        /* CANCEL THE ANNOTATION */
                        var annotationForm = document.querySelector(".annotation-form:not(.d-none)");
                        var safeCancelBtn = annotationForm.querySelector("button[data-type='cancel-annotation']");
                        var annotationId = safeCancelBtn.getAttribute("data-cancel");
                        /* search all elements with the annotation id */
                        var annotationDiv = tinymce.activeEditor.dom.select('div[data-annotation="' + annotationId + '"]');
                        /* reinsert the original content without annotation tags */
                        var newContent = "";
                        annotationDiv.forEach((annotation) => {
                            var annotationChildren = annotation.childNodes;
                            annotationChildren.forEach((el) => {
                                if (el.tagName == "SPAN") {
                                    /* it will be automatically removed */
                                } else if (el.tagName == "P") {
                                    newContent = newContent + el.outerHTML;
                                } else {
                                    var txt = el.textContent
                                    annotation.outerHTML = "" + txt;
                                    newContent = "";
                                };
                            });
                            if (newContent !== "") {
                                annotation.outerHTML = newContent;
                            };
                        });
                        /* close the modal */
                        let modalToClose = bootstrap.Modal.getInstance(modal);
                        modalToClose.hide();
                        /* reset the layout */
                        closeAnnotationBox();
                        var defaultSettings = document.querySelector(".default-settings");
                        defaultSettings.classList.remove("d-none");

                    });
                } else {
                    /* disable the save changes button */
                    saveChangesBtn.setAttribute("disabled", "disabled");
                };
            });

            /* when the modal is closed */
            modal.addEventListener("hidden.bs.modal", () => {
                /* disable the button to delete the annotation */
                saveChangesBtn.setAttribute("disabled", "disabled");
                /* empty the input */
                safeDeletionInput.value = "";
            });

        });
    });

};

/* close annotation box when clicking on another annotation button */
let closeAnnotationBox = () => {

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
        document.querySelector(".annotation-form").classList.add("d-none");

    };

};

/* close annotation box when clicking on another annotation button */
let closeBtn = () => {
    var closeBtn = document.querySelectorAll(".btn-close.float-end");
    closeBtn.forEach((el) => {
        el.addEventListener("click", () => {
            /* remove highlight in the text */
            cancelAnnotations();
        });
    });
};

/* live check */
let liveCheck = () => {
    var input = document.querySelectorAll(".live-check");
    var checkedArr = [];
    input.forEach((el) => {
        "change keyup".split(" ").forEach((e) => {
            el.addEventListener(e, () => {
                /* lemma bracket */
                if (el.getAttribute("name") == "lemma") {
                    document.getElementById("lemma-bracket").classList.remove("d-none");
                };
                /* checkbox */
                if (el.getAttribute("type") == "checkbox") {
                    if (el.checked === true) {
                        if (checkedArr.includes(el.value) === false) {
                            checkedArr.push(el.value);
                        };
                    } else {
                        if (checkedArr.includes(el.value) === true) {
                            var index = checkedArr.indexOf(el.value);
                            if (index !== -1) {
                                checkedArr.splice(index, 1);
                            };
                        };
                    };
                    document.getElementById("live-" + el.getAttribute("name")).innerHTML = JSON.stringify(checkedArr).replace(/[[\]]/g, '').replace(/"/g, "").replace(/,/g, "");
                } else {
                    /* other elements */
                    document.getElementById("live-" + el.getAttribute("name")).innerHTML = el.value.replace(/[|]/g, " ");
                };
            });
        });
    });
    liveCheckAutocomplete();
};

/* live check cloned */
let liveCheckCloned = () => {
    /* create the clone */
    var cloned = document.querySelectorAll(".cloned-el");
    cloned.forEach((el) => {
        var id = el.id;
        var input = el.querySelectorAll(".live-check");
        input.forEach((el) => {
            "change keyup".split(" ").forEach((e) => {
                el.addEventListener(e, () => {
                    var elType = el.getAttribute("name");
                    var span = document.querySelectorAll("[data-ref='" + id + "']")[0];
                    var specSpan = span.querySelector("#live-" + elType);
                    specSpan.innerHTML = el.value;
                });
            });
        });
    });

    /* try */
    liveCheckAutocomplete();

    /* remove the clone */
    var alerts = document.querySelectorAll(".cloned-el");
    alerts.forEach((el) => {
        el.addEventListener("closed.bs.alert", () => {
            document.querySelector("[data-ref='" + el.id + "']").remove();
        });
    });
};

/* live check autocomplete */
let liveCheckAutocomplete = () => {
    var list = document.querySelectorAll(".results_list");
    list.forEach((el) => {
        el.addEventListener("click", () => {
            var id = el.getAttribute("id");
            var input = document.querySelector("[aria-controls='" + id + "']");
            var val = input.value;
            document.getElementById("live-" + input.getAttribute("name")).innerHTML = val.replace(/[|]/g, " ");
        });
    });
};

/* check the annotated fragments */
let checkAnnotatedFragments = () => {

    /* MODAL */
    /* close the modal */
    var modal = document.getElementById("check-modifications");
    var closeBtn = modal.querySelector(".btn-close");
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("d-block");
    });

};