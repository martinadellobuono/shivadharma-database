document.addEventListener("DOMContentLoaded", () => {
    alerts();
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

/* annotations */
let annotations = () => {
    [].forEach.call(document.querySelectorAll(".btn-annotation"), (el) => {
        el.addEventListener("click", () => {

            /* load forms */
            const url = "/views/partials/forms/" + el.dataset.value + ".ejs";
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function () {
                document.getElementById(el.dataset.value).innerHTML = this.responseText;
            }
            xhttp.open("GET", url, true);
            xhttp.send();

            /* get selected text */
            if (document.getSelection) {
                let setSelectedStr = () => {
                    const txt = document.getSelection().toString();
                    document.getElementById("selected-annotation-type").innerHTML = "Create: " + '"' + el.innerHTML + '"';
                    document.getElementById("selected-string").value = txt
                };
                setTimeout(setSelectedStr, 100);
            };

            /* try */
            /*var input = document.getElementById("form").children;
            for (let i = 0; i < input.length; i++) {
                if (input[i].querySelector("input")!== null && input[i].querySelector("input").hasAttribute("name") == true) {
                    console.log(input[i].querySelector("input").getAttribute("name"));
                };
            };*/

        });
    });
};
