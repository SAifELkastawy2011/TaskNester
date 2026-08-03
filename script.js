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
        const today = new Date();

        date.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (date < today) {
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

    delete() {
        const index = tasks.findIndex(task => task.id === this.id);

        if (index === -1) {
            return false;
        }

        tasks.splice(index, 1);

        localStorage.setItem("tasks", JSON.stringify(tasks));

        return true;
    }

    edit({
        title,
        description,
        dueDate,
        priority,
        status,
    }) {
        if (title !== undefined) {
            this.title = title;
        }

        if (description !== undefined) {
            this.description = description;
        }

        if (dueDate !== undefined) {
            this.dueDate = dueDate;
        }

        if (priority !== undefined) {
            this.priority = priority;
        }

        if (status !== undefined) {
            this.status = status;
        }

        this.save();
    }

    start() {
        if (this.status === Task.STATUS.COMPLETED) {
            throw new Error("Completed tasks cannot be started.");
        }

        this.status = Task.STATUS.IN_PROGRESS;
        this.save();
    }

    complete() {
        this.status = Task.STATUS.COMPLETED;
        this.save();
    }

    static fromJSON(data) {
        const task = Object.create(Task.prototype);

        task.id = data.id;
        task._title = data.title;
        task._description = data.description;
        task._dueDate = data.dueDate;
        task._priority = data._priority;
        task._status = data._status;

        return task;
    }
}

let tasks = (JSON.parse(localStorage.getItem("tasks")) || []).map(Task.fromJSON);

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

function alarmNearEndTask() {
    const uncompletedTasks = tasks.filter(task => task.status !== Task.STATUS.COMPLETED).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const oneDayInMs = 1000 * 60 * 60 * 24;
    const daysLeft = uncompletedTasks.length > 0 ? Math.ceil((new Date(uncompletedTasks[0].dueDate) - new Date()) / oneDayInMs) : null;
    if (daysLeft !== null && daysLeft < 0) {
        alert(`"${uncompletedTasks[0].title}" is overdue finish it fast!`);
        if (uncompletedTasks[0].priority !== Task.PRIORITY.HIGH) {
            uncompletedTasks[0].priority = Task.PRIORITY.HIGH;
            uncompletedTasks[0].save();
        }
    }else if(daysLeft !== null && daysLeft === 0) {
        alert(`You have a task "${uncompletedTasks[0].title}" that is due today!`);
    }else if (daysLeft !== null && daysLeft === 1) {
        alert(`You have a task "${uncompletedTasks[0].title}" that is due tomorrow!`);
    }else if (daysLeft !== null && daysLeft > 1) {
        alert(`You have a task "${uncompletedTasks[0].title}" that is due in ${daysLeft} day(s)!`);
    }
};

alarmNearEndTask();