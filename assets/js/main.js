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
                document.getElementById("selected-string").value = tinymce.activeEditor.selection.getContent();
                /* show forms */
                if (tinymce.activeEditor.selection.getContent() !== "") {
                    document.getElementById(el.dataset.value).classList.add("show-block");
                };
            };
        });
    });
};
