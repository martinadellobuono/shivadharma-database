var appEntries = document.querySelectorAll(".entries");

for (var i = 0; i < appEntries.length; i++) {
    appEntries[i].addEventListener("click", (e) => {
        var idAppEntry = e.target.getAttribute("data-ref");
        var txtEntries = document.querySelectorAll("span[data-type='annotation-object'][data-subtype='apparatus'][data-annotation='#" + idAppEntry + "']");

        for (var i = 0; i < txtEntries.length; i++) {
            console.log(txtEntries[i]);
        };

    });
};