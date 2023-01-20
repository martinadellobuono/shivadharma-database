document.addEventListener("DOMContentLoaded", () => {
    alerts();
    popovers();
    currentDate();
    currentTime();
    textarea();
    autocomplete();
    dependingForms();
    cloneEl();
    annotations();
    previewAnnotations();
    cancelAnnotations();
    closeBtn();
    modifyAnnotations();
    liveCheck();
    liveCheckPresence();
    /* checkAnnotatedFragments(); */
    truncation();
    lemmaVariantPresence();
    witArea();
    /* previewCheck(); */
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
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    });
};

/* current date */
let currentDate = () => {
    /* full date */
    const date = new Date();
    const month = date.toLocaleString("default", { month: "long" });
    const weekday = date.toLocaleString("default", { weekday: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    /* year */
    var years = document.querySelectorAll(".current-year");
    years.forEach((el) => {
        el.innerHTML = year;
    });
    /* complete date */
    var currentDate = weekday.charAt(0).toUpperCase() + weekday.slice(1) + " " + day + " " + month.charAt(0).toUpperCase() + month.slice(1) + " " + year;
    var currentDates = document.querySelectorAll(".current-date");
    currentDates.forEach((el) => {
        el.innerHTML = currentDate;
    });
};

/* current time */
let currentTime = () => {
    function time() {
        var date = new Date();
        var hour = date.getHours();
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes
        } else {
            minutes = date.getMinutes();
        };
        var currentTimes = document.querySelectorAll(".current-time");
        currentTimes.forEach((el) => {
            el.innerHTML = '<i class="bi bi-watch"></i> ' + hour + ":" + minutes;
        });
    };
    time();
    window.setInterval(time, 1000);
}

/* textarea */
let textarea = () => {
    var useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    tinymce.init({
        selector: ".textarea-container textarea",
        resize: "both",
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
            "[data-type='milestone'][data-start='start']::before {content: '\u25CF';}" +
            "[data-type='annotation-object'] {display: inline;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='apparatus']::before {content: '\u25CF'; color: #FFC107;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='commentary']::before {content: '\u25CF'; color: #8540F5;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='parallel']::before {content: '\u25CF'; color: #FD9843;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='translation']::before {content: '\u25CF'; color: #79DFC1;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='citation']::before {content: '\u25CF'; color: #DE5C9D;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='note']::before {content: '\u25CF'; color: #087990;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='textStructure']::before {content: '\u25CF'; color: #6C757D;}" +
            "[data-type='annotation-object'][data-subtype='apparatus'] {text-decoration: underline 3px solid #FFC107; text-underline-offset: 3px;}" +
            "[data-type='annotation-object'][data-subtype='commentary'] {text-decoration: underline 3px solid #8540F5; text-underline-offset: 3px;}" +
            "[data-type='annotation-object'][data-subtype='parallel'] {text-decoration: underline 3px solid #FD9843; text-underline-offset: 3px;}" +
            "[data-type='annotation-object'][data-subtype='translation'] {text-decoration: underline 3px solid #79DFC1; text-underline-offset: 6px;}" +
            "[data-type='annotation-object'][data-subtype='citation'] {text-decoration: underline 3px solid #DE5C9D; text-underline-offset: 6px;}" +
            "[data-type='annotation-object'][data-subtype='note'] {text-decoration: underline 3px solid #087990; text-underline-offset: 6px;}" +
            "[data-type='annotation-object'][data-subtype='textStructure'] {text-decoration: underline 3px solid #6C757D; text-underline-offset: 6px;}",
        verify_html: false,

        /* CHECK THE ANNOTATED FRAGMENTS */
        setup: (ed) => {

            /* KEYUP */
            /* omissions */
            ed.on("keyup", (e) => {
                /* lemma */
                if (ed.id == "lemmaOmissionEditor") {
                    document.getElementById("live-" + ed.id).innerHTML = ed.getContent();
                } else {
                    /* variant */
                    document.getElementById("live-" + ed.id).innerHTML = ed.getContent();
                };
            });

            /* MOUSEDOWN */
            ed.on("mousedown", (e) => {

                /* open the modal */
                var annotation = e.target.closest("[data-type='annotation-object']");
                var annotationId;

                if (annotation.getAttribute("data-annotation") !== null) {
                    annotationId = annotation.getAttribute("data-annotation");
                };

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
            threshold: 0,
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
                maxResults: undefined
            },
            resultItem: {
                highlight: true
            },
            query: (query) => {
                // split query into array
                const querySplit = query.split(";");
                // get last query value index
                const lastQuery = querySplit.length - 1;
                // trim new query
                const newQuery = querySplit[lastQuery].trim();
                return newQuery;
            },
            events: {
                input: {
                    focus: (event) => {
                        autoCompleteJS.open(jsonList);
                    },
                    selection(event) {
                        const feedback = event.detail;
                        const input = autoCompleteJS.input;
                        // trim selected value
                        const selection = feedback.selection.value.trim();
                        // split query into array and trim each value
                        const query = input.value.split(";").map(item => item.trim());
                        // remove last query
                        query.pop();
                        // add selected value
                        query.push(selection);
                        // replace input value with the new query
                        input.value = query.join(" ; ") + " ; ";
                    }
                }
            }
        });
        i++;
    });
};

/* depending forms */
let dependingForms = () => {
    const dependingForms = document.querySelectorAll(".depending-input");
    var resultInput;
    dependingForms.forEach((el) => {
        el.addEventListener("change", () => {
            if (el.hasAttribute("data-target")) {
                resultInput = el.getAttribute("data-target");
                document.getElementById(resultInput).classList.remove("d-none");
                document.getElementById(resultInput).classList.add("d-block");
            } else {
                document.getElementById(resultInput).classList.remove("d-block");
                document.getElementById(resultInput).classList.add("d-none");
            };
        });
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

            /* empty the forms - not radios and checkboxes */
            var forms = cloned.querySelectorAll("input");
            forms.forEach((el) => {
                if (el.getAttribute("type") !== "radio" && el.getAttribute("type") !== "checkbox") {
                    el.value = "";
                };
            });

            /* variants */
            if (!cloned.classList.contains("wit-clone") == true) {
                /* change the name of the cloned input */
                cloned.querySelector("input[name='variant0']").setAttribute("name", "variant" + i);
                cloned.querySelector("input[name='manuscriptVariant0']").setAttribute("name", "manuscriptVariant" + i);

                /* change the name of the presence radios */
                var checkPresence = cloned.querySelectorAll(".check-presence");
                checkPresence.forEach((presence) => {
                    /* data-workflow initial value */
                    var typeOfPresence = presence.getAttribute("data-value").split("-")[1];
                    /* data-subtype */
                    presence.setAttribute("data-subtype", "variant" + i + "-presence");
                    /* data-value */
                    presence.setAttribute("data-value", "variant" + i + "-" + typeOfPresence);
                    /* data-href */
                    if (presence.hasAttribute("data-href")) {
                        presence.setAttribute("data-href", "variant" + i + "-omission");
                    };
                    /* data-omission */
                    if (presence.hasAttribute("data-omission")) {
                        presence.setAttribute("data-omission", "variant" + i);
                    };
                    /* name */
                    presence.setAttribute("name", "variant" + i + "-presence");
                    /* radios */
                    presence.addEventListener("click", () => {
                        var presenceVal = presence.getAttribute("data-value").split("-")[0];
                        var dataWorkflow = presence.getAttribute("data-value");
                        var forms = document.querySelectorAll("[data-subtype='" + presenceVal + "'][data-workflow]");

                        forms.forEach((form) => {
                            if (form.getAttribute("data-workflow") == dataWorkflow) {
                                form.classList.remove("d-none");
                            } else {
                                form.classList.add("d-none");
                            };
                        });
                    });
                });

                /* presence blocks */
                var presenceBlocks = cloned.querySelectorAll("[data-workflow]");
                presenceBlocks.forEach((block) => {
                    /* data-subtype */
                    block.setAttribute("data-subtype", "variant" + i);
                    /* data-workflow initial value */
                    var typeOfPresence = block.getAttribute("data-workflow").split("-")[1];
                    /* data-workflow */
                    block.setAttribute("data-workflow", "variant" + i + "-" + typeOfPresence);
                });

                /* change the value of data-href of the cloned truncation */
                var truncationRadios = cloned.querySelectorAll("[type='radio'][data-subtype='truncation']");
                truncationRadios.forEach((radio) => {
                    /* attributes to create a link between the radio and the input */
                    radio.setAttribute("name", "variant" + i + "-radios");
                    radio.setAttribute("data-href", "variant" + i);
                    /* set no truncation as preselected option */
                    radio.checked = false;
                    if (radio.getAttribute("data-value") == "notruncation") {
                        radio.checked = true;
                    };
                });

                /* omission comment blocks */
                /* remove the cloned textarea */
                var omissionTextarea = cloned.querySelector("[data-subtype='omissionComment']");
                omissionTextarea.remove();
                /* create a new textarea */
                var container = cloned.querySelector(".textarea-container");
                var newTextarea = document.createElement("textarea");
                container.innerHTML = "";
                container.appendChild(newTextarea);
                /* set the attributes to the new textarea */
                newTextarea.setAttribute("class", "mt-1");
                newTextarea.setAttribute("placeholder", "Insert additional notes...");
                newTextarea.setAttribute("data-type", "apparatus");
                newTextarea.setAttribute("data-subtype", "omissionComment");
                newTextarea.setAttribute("aria-hidden", "true");
                newTextarea.setAttribute("name", "variant" + i + "Omission");
                newTextarea.setAttribute("id", "variant" + i + "-OmissionEditor");
                /* initialize the new textarea */
                setTimeout("textarea()", 500);
            } else {
                /* witnesses */
                /* expand sections */
                var idToChange = cloned.querySelector("a.expand-section").getAttribute("href");
                cloned.querySelector("a.expand-section").setAttribute("href", "#expand-metadata" + i);
                cloned.querySelector(idToChange).setAttribute("id", "expand-metadata" + i);

                /* close the expanded sections */
                var collapsed = cloned.querySelector(".collapse");
                if (collapsed.classList.contains("show")) {
                    collapsed.classList.remove("show");
                    cloned.querySelector("a.expand-section").setAttribute("aria-expanded", "false");
                };

                /* change the name of the cloned input */
                var clonedInputs = cloned.querySelectorAll("[name]");
                clonedInputs.forEach((input) => {
                    var val = input.getAttribute("name").slice(0, -1) + i;
                    input.setAttribute("name", val);
                });

                /* textareas */
                var textareas = cloned.querySelectorAll("[data-type='witness-metadata']");
                var name;
                textareas.forEach((textarea) => {
                    name = textarea.getAttribute("name");
                    var container = textarea.parentNode;
                    /* remove the cloned textarea */
                    textarea.remove();
                    /* create new textareas */
                    var newTextarea = document.createElement("textarea");
                    container.innerHTML = "";
                    container.appendChild(newTextarea);
                    /* set the attributes to the new textarea */
                    newTextarea.setAttribute("class", "mt-1");
                    newTextarea.setAttribute("data-type", "witness-metadata");
                    /* newTextarea.setAttribute("data-subtype", "omissionComment"); */
                    newTextarea.setAttribute("aria-hidden", "true");
                    newTextarea.setAttribute("name", name);
                    newTextarea.setAttribute("id", name);
                    /* initialize the new textarea */
                    setTimeout("textarea()", 500);
                });
            };

            /* autocomplete */
            var autocompleteInputs = cloned.querySelectorAll("[data-list]");
            autocompleteInputs.forEach((input) => {
                input.id = input.getAttribute("name");
            });

            /* print the clone */
            var appendClone = document.getElementById(cloneVal);
            appendClone.appendChild(cloned);

            /* live check */
            if (!cloned.classList.contains("wit-clone") == true) {
                /* assign a specific class */
                cloned.classList.add("cloned-el");

                /* clone live check */
                var n = i - 1;
                var toCloneLiveCheck = document.getElementById("live-clone-" + cloneVal + n);
                var clonedLiveCheck = toCloneLiveCheck.cloneNode(true);
                document.getElementById("add-live-clone-" + cloneVal).appendChild(clonedLiveCheck);

                /* assign a specific id to the cloned element */
                cloned.id = cloneVal + "-" + i;

                /* assign specific attributes to the cloned live check */
                clonedLiveCheck.setAttribute("id", "live-clone-" + cloneVal + i);
                clonedLiveCheck.setAttribute("data-ref", cloneVal + "-" + i);

                /* assign specific attributes to the cloned live check children */
                clonedLiveCheck.querySelector("[data-subtype='variant']").setAttribute("id", "live-" + cloneVal + i);
                clonedLiveCheck.querySelector("[data-subtype='witnesses']").setAttribute("id", "live-manuscriptVariant" + i);

                /* additional notes */
                clonedLiveCheck.querySelector("[data-subtype='additional-notes']").setAttribute("id", "live-variant" + i + "-OmissionEditor");

                /* empty the live check spans */
                var formsLiveCheck = clonedLiveCheck.querySelectorAll("span");
                formsLiveCheck.forEach((el) => {
                    el.innerHTML = "";
                });
            };

            /* i */
            i++;

            /* remove duplicates */
            /* cloned.querySelectorAll("[data-list]")[0].classList.remove("no-autocomplete-duplicates"); */
            var autocompleteInputs = cloned.querySelectorAll("[data-list]");
            autocompleteInputs.forEach((input) => {
                input.classList.remove("no-autocomplete-duplicates");
            });

            /* autocomplete */
            autocomplete();

            /* live check */
            liveCheckCloned();

            /* truncation */
            truncation();
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

            /* type of annotation */
            var category = el.getAttribute("data-value");

            /* get selected text */
            if (document.getSelection) {
                if (tinymce.activeEditor.selection.getContent() !== "") {

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

                    /* click on annotation tab */
                    var formToShow = document.querySelector(".annotation-form." + category);
                    var someTabTriggerEl = formToShow.querySelector("button[data-bs-target='#annotate-" + category + "']")
                    var tab = new bootstrap.Tab(someTabTriggerEl);
                    tab.show();

                    /* selected fragment form */
                    document.querySelector("[name='selectedFragment'][data-value='" + category + "']").value = tinymce.activeEditor.selection.getContent({ format: "text" }).trim();

                    /* generate an ID for each annotation */
                    var idInputs = formToShow.querySelectorAll("input.id-input");
                    idInputs.forEach((input) => {
                        var idAnnotation = category + Math.random().toString(16).slice(2) + (new Date()).getTime();
                        input.value = idAnnotation;
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

                    /* CANCEL BUTTON */
                    /* assign the same id to the cancel button */
                    var annotationForm = document.querySelector(".annotation-form:not(.d-none)");
                    var safeCancelBtn = annotationForm.querySelector("button[data-type='cancel-annotation']");
                    safeCancelBtn.setAttribute("data-cancel", "annotation-" + n);

                } else {
                    /* show default settings */
                    var formToHide = document.querySelector(".annotation-form." + category);
                    formToHide.classList.add("d-none");
                    document.querySelector(".default-settings").classList.remove("d-none");
                    /* warning that you have selected nothing */
                    document.getElementById("annotation-warning").innerHTML = '<div class="alert alert-warning alert-dismissible fade show" role="alert"><p>Highlight the fragment in the text you want to annotate, then click.</p><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
                };

            };
        });

    });
};

/* preview annotations */
let previewAnnotations = () => {
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

/* modify annotations */
let modifyAnnotations = () => {
    var modifyBtn = document.querySelectorAll(".modify-btn");
    modifyBtn.forEach((btn) => {
        btn.addEventListener("click", () => {
            var type = btn.getAttribute("data-type");
            var form = document.getElementById(type + "-req");
            var dataContainer = btn.closest(".container-" + type);
            var data = dataContainer.querySelectorAll("[data-name]");

            /* click on the annotate tab */
            var tab = document.querySelector("[data-bs-target='#annotate-" + type + "']");
            tab.click();

            /* show the correct category form */
            var forms = document.querySelectorAll(".annotation-form." + type);
            forms.forEach((form) => {
                form.classList.remove("d-none");
            });

            /* input to fill in */
            data.forEach((el) => {
                var name = el.getAttribute("data-name");
                var val = el.getAttribute("data-fill");

                /* clone variant containers */
                if (el.getAttribute("data-subtype") == "variant") {
                    if (el.getAttribute("data-name") !== "variant0") {
                        form.querySelector("[data-clone='variant']").click();
                    };
                };

                /* types of input */
                /* numbers */
                let numbers = () => {
                    var numbers = form.querySelectorAll("[type='number'][name='" + name + "']");
                    numbers.forEach((number) => {
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
                        text.value = val;
                        /* selected fragment */
                        if (name == "lemma") {
                            form.querySelector("input[name='selectedFragment']").value = val;
                        };
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
                        list.value = val;
                        /* live check */
                        if (type == "apparatus") {
                            document.getElementById("live-" + name).innerHTML = val;
                        };
                    });
                };

                /* textareas */
                let textareas = () => {
                    var textareas = form.querySelectorAll("textarea[name='" + name + "']");
                    textareas.forEach((textarea) => {
                        let printTxt = () => {
                            tinyMCE.get(textarea.id).setContent(val);
                        };
                        setTimeout(printTxt, 2000);
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
        });
    });
};

/* live check */
/* textarea live check in textarea() */
let liveCheck = () => {
    var input = document.querySelectorAll(".live-check");
    var padaStart = [];
    var padaEnd = [];

    input.forEach((el) => {
        "change keyup".split(" ").forEach((e) => {
            el.addEventListener(e, () => {
                /* radios */
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
                /* lemma */
                if (el.getAttribute("name") == "stanzaEnd") {
                    if (el.value !== "") {
                        /* add dash */
                        document.getElementById("stanza-dash").classList.remove("d-none");
                    } else {
                        /* remove dash */
                        document.getElementById("stanza-dash").classList.add("d-none");
                    };
                };
                /* lemma */
                if (el.getAttribute("name") == "lemma") {
                    /* bracket */
                    document.getElementById("lemma-bracket").classList.remove("d-none");
                };
                /* checkbox */
                if (el.getAttribute("type") == "checkbox") {
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
                        document.getElementById("live-" + el.getAttribute("name")).innerHTML = JSON.stringify(padaStart).replace(/[[\]]/g, '').replace(/"/g, "").replace(/,/g, "");
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
                        document.getElementById("live-" + el.getAttribute("name")).innerHTML = JSON.stringify(padaEnd).replace(/[[\]]/g, '').replace(/"/g, "").replace(/,/g, "");
                    };
                } else {
                    /* other elements */
                    document.getElementById("live-" + el.getAttribute("name")).innerHTML = el.value.replace(/[;]/g, " ");
                };
            });
        });
    });
    liveCheckAutocomplete();
};

/* live check presence */
let liveCheckPresence = () => {
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
                    /* truncation */
                    var radiosParents = el.parentNode.querySelectorAll(".form-check");
                    radiosParents.forEach((radioParent) => {
                        var radios = radioParent.querySelectorAll("[type='radio']");
                        radios.forEach((radio) => {
                            radio.addEventListener("change", () => {
                                document.getElementById("live-" + el.getAttribute("name")).innerHTML = el.value;
                            });
                        });
                    });

                    /* other elements */
                    var elType = el.getAttribute("name");
                    var span = document.querySelectorAll("[data-ref='" + id + "']")[0];
                    var specSpan = span.querySelector("#live-" + elType);
                    specSpan.innerHTML = el.value;
                });
            });
        });

        /* present / omission radios */
        var presenceRadios = el.querySelectorAll(".check-presence");
        presenceRadios.forEach((radio) => {
            radio.addEventListener("change", () => {
                var liveCheck = document.getElementById("live-" + radio.getAttribute("data-omission"));
                if (radio.getAttribute("data-value").indexOf("omission") > -1) {
                    var omittedInput = document.querySelector("[name='" + radio.getAttribute("data-omission") + "']");
                    omittedInput.value = "";
                    liveCheck.innerHTML = "om.";
                } else {
                    liveCheck.innerHTML = "";
                };
            });
        });
    });

    /* live check autocomplete */
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
            document.getElementById("live-" + input.getAttribute("name")).innerHTML = val.replace(/[;]/g, " ");
        });
    });
};

/* check the annotated fragments */
let checkAnnotatedFragments = () => {
    /* modal */
    /* close the modal */
    var modal = document.getElementById("check-modifications");
    var closeBtn = modal.querySelector(".btn-close");
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("d-block");
    });
};

/* truncation */
let truncation = () => {
    var radios = document.querySelectorAll("[type='radio'][data-subtype='truncation']");
    radios.forEach((radio) => {
        radio.addEventListener("click", () => {
            var val = radio.getAttribute("data-value");
            var input = document.querySelector("[name='" + radio.getAttribute("data-href") + "']");

            /* remove ° */
            input.value = input.value.replace(/\°/g, "");

            /* add ° */
            switch (val) {
                case "circlefront":
                    input.value = "\u00B0" + input.value;
                    break;
                case "circleback":
                    input.value = input.value + "\u00B0";
                    break;
                case "circlearound":
                    input.value = "\u00B0" + input.value + "\u00B0";
                    break;
                default:
                    input.value = input.value;
            };
        });
    });
};

/* lemma / variant presence */
let lemmaVariantPresence = () => {
    /* click on the radio to show the right block between present lemma / variant and omission */
    var presenceRadios = document.querySelectorAll(".check-presence");
    presenceRadios.forEach((presence) => {
        presence.addEventListener("click", () => {
            var presenceVal = presence.getAttribute("data-value").split("-")[0];
            var dataWorkflow = presence.getAttribute("data-value");
            var forms = document.querySelectorAll("[data-subtype='" + presenceVal + "'][data-workflow]");
            forms.forEach((form) => {
                if (form.getAttribute("data-workflow") == dataWorkflow) {
                    form.classList.remove("d-none");
                } else {
                    form.classList.add("d-none");
                };
            });

        });
    });

    /* omissions */
    let omissions = () => {
        var omissionCheckboxes = document.querySelectorAll("[type='radio'][data-subtype='omission']");
        omissionCheckboxes.forEach((checkbox) => {
            checkbox.addEventListener("click", () => {

                /* data omission = what is omitted */
                var dataOmission = document.querySelector("[name='" + checkbox.getAttribute("data-omission") + "']");

                /* data href = comments on what is omitted */
                var dataHref = document.querySelector("[name='" + checkbox.getAttribute("data-href") + "']");
                var dataHrefId = dataHref.id;

                /* checked omission */
                if (checkbox.checked) {
                    /* local storage of the data omission */
                    localStorage.setItem(checkbox.getAttribute("data-omission"), dataOmission.value);
                    /* empty the data omission input */
                    dataOmission.value = "";

                    /* fill in the data href input */
                    tinyMCE.get(dataHrefId).setContent(localStorage.getItem(checkbox.getAttribute("data-href")));
                } else {
                    /* unchecked omission */
                    /* refill the data omission input with the old data omission */
                    dataOmission.value = localStorage.getItem(checkbox.getAttribute("data-omission"));

                    /* local storage of the comment */
                    localStorage.setItem(checkbox.getAttribute("data-href"), tinyMCE.get(dataHrefId).getContent());
                    /* empty the data href input with the old data href */
                    tinyMCE.get(dataHrefId).setContent("");
                };
            });
        });
    };
};

/* area of witnesses */
let witArea = () => {
    /* on change the area unit */
    var unitsList = document.querySelectorAll(".dimensions-unit");
    unitsList.forEach((unit) => {
        unit.addEventListener("change", (e) => {
            /* print the area unit */
            var selectedUnit = unit.options[unit.options.selectedIndex];
            /* convert width height */
            var numericValues = document.querySelectorAll("[data-ref=" + e.target.getAttribute("name") + "]");
            numericValues.forEach((val) => {
                if (selectedUnit.value == "cm") {
                    var x = val.value;
                    var y = 2.54;
                    val.value = x * y;
                } else {
                    var x = val.value;
                    var y = 2.54;
                    val.value = x / y;
                };
            });
        });
    });
};

/* preview check */
let previewCheck = () => {
    var previewCheck = document.querySelectorAll("input.previewCheck");
    var targetCheck = document.querySelectorAll("label.previewCheck");
    targetCheck.forEach((target) => {
        var check = target.getAttribute("data-value");
        previewCheck.forEach((input) => {
            if (input.value == check) {
                /* check the radio/checkbox depending on the db value */
                input.checked = true;
                /* if depending input show the depending form */
                if (input.classList.contains("depending-input") == true) {
                    var formToShow = input.getAttribute("data-target");
                    document.getElementById(formToShow).classList.remove("d-none");
                };
            };
        });
    });
};