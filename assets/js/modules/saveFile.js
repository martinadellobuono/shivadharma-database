/* SAVE FILE */
/* SAVE DATA TO PASS TO BACKEND */
/* save file json to send to the database */
var data;

/* initialise the file textarea */
export const fileTextarea = () => {
    /* create textarea */
    tinymce.init({
        selector: ".file-container textarea",
        resize: "both",
        width: "100%",
        plugins: "preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime lists wordcount help charmap quickbars",
        menubar: "file edit view insert format tools table help",
        menu: {
            format: { title: "Format", items: "bold italic underline strikethrough | superscript subscript | codeformat | formats blockformats fontsizes align | backcolor | removeformat" },
        },
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
        height: "65vh",
        image_caption: true,
        quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
        toolbar_mode: "sliding",
        contextmenu: "link image table",
        content_style: "body {font-family:'Book Antiqua'; font-size:16px}" +
            "[data-type='milestone'][data-start='start']::before {content: '\u25CF';}" +
            "[data-type='annotation-object'] {display: inline;}" +
            ".hidden-annotation {text-decoration: none !important;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='apparatus']::before {content: '\u25CF'; color: #9EC4FC;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='commentary']::before {content: '\u25CF'; color: #8540F5;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='parallel']::before {content: '\u25CF'; color: #FD9843;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='translation']::before {content: '\u25CF'; color: #79DFC1;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='citation']::before {content: '\u25CF'; color: #DE5C9D;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='note']::before {content: '\u25CF'; color: #087990;}" +
            "[data-type='milestone'][data-start='start'][data-subtype='textStructure']::before {content: '\u25CF'; color: #6C757D;}" +
            "[data-type='annotation-object'][data-subtype='apparatus'] {text-decoration: underline 3px solid #9EC4FC; text-underline-offset: 2px;}" +
            "[data-type='annotation-object'][data-subtype='commentary'] {text-decoration: underline 3px solid #8540F5; text-underline-offset: 4px;}" +
            "[data-type='annotation-object'][data-subtype='parallel'] {text-decoration: underline 3px solid #FD9843; text-underline-offset: 6px;}" +
            "[data-type='annotation-object'][data-subtype='translation'] {text-decoration: underline 3px solid #79DFC1; text-underline-offset: 8px;}" +
            "[data-type='annotation-object'][data-subtype='citation'] {text-decoration: underline 3px solid #DE5C9D; text-underline-offset: 10px;}" +
            "[data-type='annotation-object'][data-subtype='note'] {text-decoration: underline 3px solid #087990; text-underline-offset: 12px;}" +
            "[data-type='annotation-object'][data-subtype='textStructure'] {text-decoration: underline 3px solid #6C757D; text-underline-offset: 14px;}",
        verify_html: false,

        /* OPERATIONS ON THE TEXTUS */
        setup: (ed) => {

            /* when the text changes */
            "input keyup mousedown paste".split(" ").forEach((event) => {
                ed.on(event, async (e) => {

                    /* SAVE FILE */
                    /* save in a json the content to overwrite the file of the textus */
                    var url = window.location.href;
                    var idEdition = url.split("/").pop().split("-")[0];
                    var idEditor = url.split("/").pop().split("-")[1];
                    var contentFile = ed.getContent();

                    /* DETECT CHANGES IN PRE-ANNOTATED FRAGMENT */
                    /* detect the change of node on the text-cursor moving */
                    var currentNode = ed.selection.getNode();
                    var idFragment = currentNode.getAttribute("data-annotation");
                    var contentFragment = currentNode.textContent;

                    /* if the id is not null > there is an annotation */
                    if (idFragment !== null) {

                        /* create the json to send to the database > id annotation + new fragment */
                        data = {
                            idEdition: idEdition,
                            idEditor: idEditor,
                            contentFile: contentFile,
                            idFragment: idFragment.replace("#", ""),
                            contentFragment: contentFragment
                        }

                        /* show the message that the new fragment has been saved */
                        document.getElementById("fragment-message").classList.remove("d-none");
                        setTimeout(() => {
                            document.getElementById("fragment-message").classList.add("d-none");
                        }, 5000);

                    } else {
                        /* create the json to send to the database > id annotation + new fragment */
                        data = {
                            idEdition: idEdition,
                            idEditor: idEditor,
                            contentFile: contentFile
                        }
                    };

                });
            });

        }
    });
};

/* save file every 5 seconds */
export const saveFile = (data, callback) => {
    fetch("/saveFile", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            document.getElementById("autosaved-message").classList.remove("d-none");
            setTimeout(() => {
                document.getElementById("autosaved-message").classList.add("d-none");
            }, 2000);
            if (callback) callback(null, data);
        })
        .catch(err => {
            console.error('There was a problem with the save operation:', err);
            if (callback) callback(err);
        });
};

/* stop loading the page when submitting data */
export const stopLoading = () => {
    /* remove window.stop() to allow page reload */
    var navLink = document.querySelectorAll(".nav-link");
    for (var i = 0; i < navLink.length; i++) {
        navLink[i].addEventListener("click", () => {
            saveFile();
        });
    }
};