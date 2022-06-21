document.addEventListener("DOMContentLoaded", () => {
    alerts();
    annotations();
    textarea();
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
    tinymce.init({
        selector: "#base-text"
    });
};

/* annotations */
let annotations = () => {
    [].forEach.call(document.querySelectorAll(".btn-annotation"), (el) => {
        el.addEventListener("click", () => {
            /* get selected text */
            if (document.getSelection) {
                document.getElementById("selected-fragment").value = tinymce.activeEditor.selection.getContent();
                /* show forms */
                if (tinymce.activeEditor.selection.getContent() !== "") {
                    document.getElementById(el.dataset.value).classList.add("d-block");
                } else {
                    document.getElementById("annotation-warning").innerHTML = '<div class="alert alert-warning alert-dismissible fade show" role="alert"><p>Highlight the fragment in the text you want to annotate, then click.</p><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
                };
            }; 
        });
    });
};
