document.addEventListener("DOMContentLoaded", () => {
    alerts();
    textarea();
    autocomplete();
    cloneEl();
    annotations();
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

/* textarea */
let textarea = () => {
    var useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    tinymce.init({
        selector: "#base-text > textarea",
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
            }

            /* Provide image and alt text for the image dialog */
            if (meta.filetype === "image") {
                callback("https://www.google.com/logos/google.jpg", { alt: "My alt text" });
            }

            /* Provide alternative source and posted for the media dialog */
            if (meta.filetype === "media") {
                callback("movie.mp4", { source2: "alt.ogg", poster: "https://www.google.com/logos/google.jpg" });
            }
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
        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }"
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
                cache: true,
            },
            resultsList: {
                id: "autoComplete_list_" + i,
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
    var i = 0;
    [].forEach.call(document.querySelectorAll("[data-clone]"), (el) => {
        el.addEventListener("click", () => {
            var cloneVal = el.getAttribute("data-clone");
            var toClone = document.querySelectorAll("[data-cloned='" + cloneVal + "']");
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
            /* print the clone */
            var appendClone = document.getElementById(cloneVal);
            appendClone.appendChild(cloned);
            i++;
            /* remove duplicates */
            cloned.querySelectorAll("[data-list]")[0].classList.remove("no-autocomplete-duplicates");
            autocomplete();
        });
    });
};

/* annotations */
let annotations = () => {
    [].forEach.call(document.querySelectorAll(".btn-annotation"), (el) => {
        el.addEventListener("click", () => {
            /* get selected text */
            if (document.getSelection) {
                document.getElementById("selected-fragment").value = tinymce.activeEditor.selection.getContent({ format: "text" }).trim();
                /* show forms */
                if (tinymce.activeEditor.selection.getContent() !== "") {
                    document.getElementById(el.dataset.value).classList.remove("d-none");
                } else {
                    document.getElementById("annotation-warning").innerHTML = '<div class="alert alert-warning alert-dismissible fade show" role="alert"><p>Highlight the fragment in the text you want to annotate, then click.</p><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
                };
            };
            /* live check */
            /* apparatus */
            if (el.getAttribute("data-value") == "apparatus") {
                /* stanza */
                var inputStanza = document.querySelectorAll("[name='stanza']")[0];
                "change keyup".split(" ").forEach((e) => {
                    inputStanza.addEventListener(e, () => {
                        document.getElementById("live-stanza").innerHTML = inputStanza.value;
                    });
                });
                /* pada */
                var inputPada = document.querySelectorAll("[name='pada']");
                var checkedArr = [];
                inputPada.forEach((el) => {
                    el.addEventListener("change", () => {
                        inputPada.forEach((el) => {
                            if (el.checked === true) {
                                if (checkedArr.includes(el.value) === false) {
                                    checkedArr.push(el.value);
                                };
                            };
                            if (el.checked === false) {
                                if (checkedArr.includes(el.value) === true) {
                                    checkedArr.pop(el.value);
                                };
                            };
                        });
                        document.getElementById("live-pada").innerHTML = JSON.stringify(checkedArr).replace(/[[\]]/g, '').replace(/"/g, "").replace(/,/g, "");
                    });
                });
                /* lemma */
                var inputLemma = document.querySelectorAll("[name='lemma']")[0];
                inputLemma.addEventListener("keyup", () => {
                    document.getElementById("live-lemma").innerHTML = " " + inputLemma.value + " &#x5d; ";
                });
                /* lemma witnesses */
                var inputLemmaWits = document.querySelectorAll("[name='manuscriptLemma']")[0];
                inputLemmaWits.addEventListener("keyup", () => {
                    document.getElementById("live-lemma-wits").innerHTML = inputLemmaWits.value.replace(" | ", " ");
                });
            };
        });
    });
};