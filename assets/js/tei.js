let downloadTei = () => {
    /* textus txt */
    var url = window.location.href.split("/");
    var file = url[url.length - 1].replace("html", "xml");
    window.location.href = "/tei/" + encodeURIComponent(file);
};