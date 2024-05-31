/* edition metadata */
/* metadata textareas */
export const metadataTextareas = () => {
    tinymce.init({
        selector: ".metadata-container textarea",
        resize: "both",
        width: "100%",
        plugins: "preview searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime lists wordcount help charmap quickbars",
        menubar: "file edit view insert format tools table help",
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
        height: "50vh",
        image_caption: true,
        quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
        toolbar_mode: "sliding",
        contextmenu: "link image table"
    });
};

/* dimensions of witnesses calculated when inserting a manuscript in the metadata form in edit */
export const witnessDimensions = () => {
    /* on change the area unit */
    var unitsList = document.querySelectorAll(".dimensions-unit");
    unitsList.forEach((unit) => {
        unit.addEventListener("change", (e) => {
            /* print the area unit */
            var selectedUnit = unit.options[unit.options.selectedIndex];
            /* convert width height */
            var numericValues = document.querySelectorAll("[data-ref=" + e.target.getAttribute("name") + "]");
            numericValues.forEach((val) => {
                if (selectedUnit.value == "cm") {
                    var x = val.value;
                    var y = 2.54;
                    val.value = x * y;
                } else {
                    var x = val.value;
                    var y = 2.54;
                    val.value = x / y;
                };
            });
        });
    });
};