document.addEventListener("click", async (e) => {
    /* get the type of entity to delete */
    var btn = e.target;
    var dataSourceBtn;
    if (btn.parentNode.tagName === "BUTTON") {
        dataSourceBtn = btn.parentNode;
    } else {
        dataSourceBtn = btn;
    };

    /* data to delete */
    var nodeID = dataSourceBtn.getAttribute("data-node-id");
    if (nodeID) {
        /* data to send to the post function in the backend */
        var data = {
            nodeID: nodeID
        }
        var editionID = window.location.href.split("/").pop().split("-")[0];
        var editorID = window.location.href.split("/").pop().split("-")[1];
        var url;

        /* call the post function to delete the entity */
        try {

            let fetchDelete = async () => {
                const response = await fetch("/delete/" + editionID + "-" + editorID, {
                    method: "POST",
                    headers: { "Content-type": "application/json; charset=UTF-8" },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error("Can't call post to delete data");
                };
                await response.json();
                url = response["url"];
            }
            
            /* redirect the page */
            fetchDelete().then(() => {
                url = url.replace("delete", "edit");
                window.location.href = url;
            });
        } catch (err) {
            console.error(err);
        };
    };
});