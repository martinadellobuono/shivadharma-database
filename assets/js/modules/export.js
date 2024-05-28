/* export the edition into pdf, txt, xml/tei */
/* PDF export */
export const generatePDF = () => {
    /* expand collapsible elements to print the pdf */
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
    };

    var url = window.location.href.split("/");

    /* avoid # in url */
    var oldUrl = window.location.href;
    var fileName = url[url.length - 1].replace("html", "txt");

    /* click on pdf download button */
    document.getElementById("pdf-download").addEventListener("click", () => {
        expandAllCollapsibles().then(() => {
            const header = document.getElementById("header");
            const txt = document.getElementById("textus");

            /* title editors and textus */
            const container = document.createElement("div");
            container.appendChild(header);
            const spacer = document.createElement("div");
            spacer.style.marginBottom = "20px";
            container.appendChild(spacer);
            container.appendChild(txt);

            var opt = {
                margin: 1,
                filename: fileName,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
                pagebreak: { mode: ["avoid-all", "css", "legacy"] }
            };

            /* generate pdf */
            html2pdf().set(opt).from(container).toPdf().get("pdf").then(function (pdf) {
                var totalPages = pdf.internal.getNumberOfPages();
                for (var i = 1; i <= totalPages; i++) {
                    pdf.setPage(i);
                    pdf.setFontSize(10);
                    pdf.setTextColor(150);
                    pdf.text(String(i), (pdf.internal.pageSize.getWidth() / 2), pdf.internal.pageSize.getHeight() - 0.5, { align: "center" });
                };
                pdf.save(fileName);

                /* back to the edition page */
                window.location.href = oldUrl.replace("#", "");
            }).catch(error => {
                console.error("Failed to generate PDF: ", error);
            });
        }).catch(error => {
            console.error("Failed to expand all collapsibles: ", error);
        });
    });
};

/* txt export */
/* the file is created into routes/txt.js */
export const downloadTxt = () => {
    /* textus txt */
    var url = window.location.href.split("/");
    var file = url[url.length - 1].replace("html", "txt");
    document.getElementById("txt-download").addEventListener("click", () => {
        window.location.href = "/txt/" + encodeURIComponent(file);
    });
};

/* xml/tei export */
/* the file is created into routes/tei.js */
export const downloadTei = () => {
    /* textus txt */
    var url = window.location.href.split("/");
    var file = url[url.length - 1].replace("html", "xml");
    document.getElementById("xml-tei-download").addEventListener("click", () => {
        window.location.href = "/tei/" + encodeURIComponent(file);
    });
};