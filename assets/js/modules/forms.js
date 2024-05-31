/* autocomplete */
export const autocomplete = () => {
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
export const dependingForms = () => {
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
export const cloneEl = () => {
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

                /* notes */
                /* remove the cloned textarea */
                var omissionTextarea = cloned.querySelector("[data-subtype='omissionComment']");
                omissionTextarea.remove();
                /* create a new textarea */
                var container = cloned.querySelector(".apparatus-container");
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
                let textarea = () => {
                    /* init textareas */
                    var selector = ".apparatus-container textarea";
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
                };
                setTimeout(textarea, 500);

                /* generate an ID for each annotation */
                var idInputs = cloned.querySelectorAll("input.id-input");
                idInputs.forEach((input) => {
                    var idAnnotation = "apparatus" + i + Math.random().toString(16).slice(2) + (new Date()).getTime();
                    input.value = idAnnotation;
                    input.setAttribute("name", "idVariant" + i);
                });

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

/* live check cloned */
const liveCheckCloned = () => {
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
};

/* truncation */
export const truncation = () => {
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
export const lemmaVariantPresence = () => {
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

/* inline location */
export const inlineLocation = () => {
    var locations = document.querySelectorAll('[data-type="location"]');
    for (var i = 0; i < locations.length; i++) {
        /* location */
        var location = locations[i];
        var locationHtml = location.outerHTML;

        /* append the position into the element before / after */
        if (location.getAttribute("data-subtype") == "location-bottom") {
            /* starting position of the location > bottom */
            var elToAppendTo = location.previousElementSibling.firstElementChild;
            elToAppendTo.insertAdjacentHTML("beforeend", locationHtml);
            location.remove();
        } else if (location.getAttribute("data-subtype") == "location-top") {
            /* starting position of the location > top */
            var elToAppendTo = location.nextElementSibling.firstElementChild;
            elToAppendTo.insertAdjacentHTML("afterbegin", locationHtml);
            location.remove();
        };
    };
};