let expandAllCollapsibles = () => {
    return new Promise(resolve => {
        let allCollapsibles = document.querySelectorAll(".collapse.inlineAppDiv");
        let totalCollapsibles = allCollapsibles.length;
        let expandedCount = 0;

        allCollapsibles.forEach(collapsible => {
            let bsCollapse = new bootstrap.Collapse(collapsible, {
                toggle: false
            });
            collapsible.addEventListener('shown.bs.collapse', () => {
                expandedCount++;
                if (expandedCount === totalCollapsibles) {
                    /* the premise is resolved once all the collapsible div are collapsed */
                    resolve();
                }
            });
            /* the collapsible div are collapsed */
            bsCollapse.show();
        });
    });
}

let generatePDF = () => {
    var url = window.location.href.split("/");
    var fileName = url[url.length - 1].replace("html", "txt");
    expandAllCollapsibles().then(() => {
        const element = document.getElementById("textus");
        var opt = {
            margin: 1,
            filename: fileName,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] }
        };

        /* generate pdf */
        html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
            var totalPages = pdf.internal.getNumberOfPages();
            for (var i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(10);
                pdf.setTextColor(150);
                pdf.text(String(i), (pdf.internal.pageSize.getWidth() / 2), pdf.internal.pageSize.getHeight() - 0.5, { align: "center" });
            };
            pdf.save();

        /* back to the edition page */
        window.location.href = "/edition/" + encodeURIComponent(fileName);
        }).catch(error => {
            console.error("Failed to generate PDF: ", error);
        });
    }).catch(error => {
        console.error("Failed to expand all collapsibles: ", error);
    });
};
