/* validation */
/* button works only if you click on it */
export const preventEnter = () => {
    /* remove effect from button */
    document.getElementById("btn-apikey").classList.remove("heartbeat");

    /* event pressing enter */
    var form = document.getElementById("form-apikey");
    form.addEventListener("keypress", (e) => {
        var key = e.charCode || e.keyCode || 0;
        if (key == 13) {
            /* prevent submitting data */
            e.preventDefault();
            /* animate the get started button */
            document.getElementById("btn-apikey").classList.add("heartbeat");
        };
    });
};