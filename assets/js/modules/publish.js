/* publish or save as draft */
export const publishEdition = () => {
    var publishBtn = document.querySelectorAll(".publish-btn");
    for (var i = 0; i < publishBtn.length; i++) {
        publishBtn[i].addEventListener("click", (e) => {

            var url = window.location.href;
            var idEdition = url.split("/").pop().split("-")[0];
            var idEditor = url.split("/").pop().split("-")[1];
            var publishType = e.target.getAttribute("data-value");

            /* type of publishment > draft or publishment */
            var publishType = {
                publishType: publishType
            }

            /* fetch the type of publishment */
            var route = "/publish/" + idEdition + "-" + idEditor;
            fetch(route, {
                method: "POST",
                body: JSON.stringify(publishType),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            })
                .then(response => response.json())
                .catch(err => console.log(err));

        });
    };
};