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