/* ui functions */
/* alerts */
export const alerts = () => {
    [].forEach.call(document.querySelectorAll(".alert"), (el) => {
        el.classList.add("show");
    });
};

/* current date */
export const currentDate = () => {
    /* full date */
    const date = new Date();
    const month = date.toLocaleString("default", { month: "long" });
    const weekday = date.toLocaleString("default", { weekday: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    /* year */
    var years = document.querySelectorAll(".current-year");
    years.forEach((el) => {
        el.innerHTML = year;
    });
    /* complete date */
    var currentDate = weekday.charAt(0).toUpperCase() + weekday.slice(1) + " " + day + " " + month.charAt(0).toUpperCase() + month.slice(1) + " " + year;
    var currentDates = document.querySelectorAll(".current-date");
    currentDates.forEach((el) => {
        el.innerHTML = currentDate;
    });
};

/* current time */
export const currentTime = () => {
    function time() {
        var date = new Date();
        var hour = date.getHours();
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes
        } else {
            minutes = date.getMinutes();
        };
        var currentTimes = document.querySelectorAll(".current-time");
        currentTimes.forEach((el) => {
            el.innerHTML = hour + ":" + minutes;
        });
    };
    time();
    window.setInterval(time, 1000);
};

/* navbar */
/* add /remove navbar background */
export const navbarBg = () => {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    if (page == "" || page == "apikey") {
        document.querySelector(".navbar").classList.remove("navbar-bg");
    } else {
        document.querySelector(".navbar").classList.add("navbar-bg");
    };
};

/* make navbar li active */
export const navbarActive = () => {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    [].forEach.call(document.querySelectorAll(".navbar-a a"), (el) => {
        var item = el.getAttribute("href").replace("/", "");
        if (item == page) {
            el.classList.add("navbar-a-active");
        } else {
            el.classList.remove("navbar-a-active");
        };
    });
};

/* popovers */
export const popovers = () => {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    });
};

/* tabs */
export const tabs = () => {
    var triggerTabList = [].slice.call(document.querySelectorAll("ul[role='tablist'] a"))
    triggerTabList.forEach(function (triggerEl) {
        var tabTrigger = new bootstrap.Tab(triggerEl);

        triggerEl.addEventListener("click", function (event) {
            event.preventDefault();
            tabTrigger.show();
        });
    });
};

/* tooltips */
export const tooltips = () => {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('*[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
};