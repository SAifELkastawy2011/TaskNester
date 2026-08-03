let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

class Task {
    static idCounter = Number(localStorage.getItem("taskIdCounter")) || 1;

    static STATUS = {
        PENDING: "pending",
        IN_PROGRESS: "inProgress",
        COMPLETED: "completed",
    };

    static PRIORITY = {
        LOW: "low",
        MEDIUM: "medium",
        HIGH: "high",
    };

    constructor(
        title,
        description,
        dueDate,
        priority,
        status = Task.STATUS.PENDING
    ) {
        this.id = Task.idCounter++;
        localStorage.setItem("taskIdCounter", Task.idCounter);

        this.title = title;
        this.description = description;
        this.dueDate = dueDate;

        this.priority = priority;
        this.status = status;

        this.save();
    }

    set priority(value) {
        const priorities = [
            Task.PRIORITY.LOW,
            Task.PRIORITY.MEDIUM,
            Task.PRIORITY.HIGH,
        ];

        if (!priorities.includes(value)) {
            throw new Error("Invalid priority.");
        }

        this._priority = value;
    }

    get priority() {
        return this._priority;
    }

    set title(value) {
        if (!value || value.trim() === "") {
            throw new Error("Title cannot be empty.");
        }
        this._title = value;
    }

    get title() {
        return this._title;
    }

    set description(value) {
        this._description = value;
    }

    get description() {
        return this._description;
    }

    set dueDate(value) {
        const date = new Date(value);
        const now = new Date();
        if (date < now) {
            throw new Error("Due date cannot be in the past.");
        }
        this._dueDate = value;
    }

    get dueDate() {
        return this._dueDate;
    }

    set status(value) {
        const statuses = [
            Task.STATUS.PENDING,
            Task.STATUS.IN_PROGRESS,
            Task.STATUS.COMPLETED,
        ];

        if (!statuses.includes(value)) {
            throw new Error("Invalid status.");
        }

        this._status = value;
    }

    get status() {
        return this._status;
    }

    save() {
        const index = tasks.findIndex(task => task.id === this.id);

        if (index === -1) {
            tasks.push(this);
        } else {
            tasks[index] = this;
        }

        const priorityOrder = {
            [Task.PRIORITY.HIGH]: 3,
            [Task.PRIORITY.MEDIUM]: 2,
            [Task.PRIORITY.LOW]: 1,
        };

        tasks.sort((a, b) => {
            const priorityDiff =
                priorityOrder[b.priority] - priorityOrder[a.priority];

            if (priorityDiff !== 0) {
                return priorityDiff;
            }

            return new Date(a.dueDate) - new Date(b.dueDate);
        });

        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
}


function setCookie(name, value, maxAge = 315360000) {
    document.cookie = `${name}=${value}; Max-Age=${maxAge}; path=/`;
}

function getCookie(name) {
    const cookie = document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="));

    return cookie ? cookie.split("=")[1] : null;
}

function loadTheme() {
    const body = document.body;
    const sun = document.getElementById("sun");
    const moon = document.getElementById("moon");

    const isDark = getCookie("darkMode") === "true";

    if (isDark) {
        body.classList.add("dark-mode");

        sun.style.display = "block";
        moon.style.display = "none";
    } else {
        body.classList.remove("dark-mode");

        sun.style.display = "none";
        moon.style.display = "block";
    }
}

function toggleMode() {
    const isDark = getCookie("darkMode") === "true";

    if (isDark) {
        setCookie("darkMode", "false");
    } else {
        setCookie("darkMode", "true");
    }

    loadTheme();
}

loadTheme();

document
    .querySelector(".modeToggleBtn")
    .addEventListener("click", toggleMode);

const menuToggleBtn = document.getElementById("menuToggleBtn");
const navLinksList = document.querySelector(".navLinksList");
const navLinks = document.querySelectorAll(".navLink");

function closeMenu() {
    if (menuToggleBtn.classList.contains("opened")) {
        menuToggleBtn.classList.remove("opened");
        menuToggleBtn.classList.add("closed");
    }
}

function toggleMenu() {
    if (menuToggleBtn.classList.contains("closed")) {
        menuToggleBtn.classList.remove("closed");
        menuToggleBtn.classList.add("opened");
    } else {
        closeMenu();
    }
}

menuToggleBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    toggleMenu();
});

navLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
});

document.addEventListener("click", function(e) {
    const isClickInside = menuToggleBtn.contains(e.target) || navLinksList.contains(e.target);
    if (!isClickInside) {
        closeMenu();
    }
});