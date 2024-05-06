let downloadTxt = () => {
    /* textus txt */
    var url = window.location.href.split("/");
    var file = url[url.length - 1].replace("html", "txt");
    window.location.href = "/txt/" + encodeURIComponent(file);
};