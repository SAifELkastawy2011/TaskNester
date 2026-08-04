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

        localStorage.setItem(
            "tasks",
            JSON.stringify(tasks.map(task => task.toJSON()))
        );
    }

    delete() {
        const index = tasks.findIndex(task => task.id === this.id);

        if (index === -1) {
            return false;
        }

        tasks.splice(index, 1);

        localStorage.setItem(
            "tasks",
            JSON.stringify(tasks.map(task => task.toJSON()))
        );

        return true;
    }

    edit({
        title,
        description,
        dueDate,
        priority,
        status,
    }) {
        if (title !== undefined) this.title = title;
        if (description !== undefined) this.description = description;
        if (dueDate !== undefined) this.dueDate = dueDate;
        if (priority !== undefined) this.priority = priority;
        if (status !== undefined) this.status = status;

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
        task._description = data.description || "";
        task._dueDate = data.dueDate;
        task._priority = data._priority;
        task._status = data._status;

        if (task.id >= Task.idCounter) {
            Task.idCounter = task.id + 1;
            localStorage.setItem("taskIdCounter", Task.idCounter);
        }

        return task;
    }

    static deleteAll() {
        tasks.length = 0;
        localStorage.setItem("tasks", JSON.stringify([]));
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            dueDate: this.dueDate,
            _priority: this.priority,
            _status: this.status,
        };
    }
}

let tasks = [];

const storedTasks = localStorage.getItem("tasks");

if (storedTasks) {
    try {
        tasks = JSON.parse(storedTasks).map(Task.fromJSON);
    } catch (error) {
        console.error("Failed to load tasks:", error);
        tasks = [];
    }
}

let editingTaskId = null;

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
    setCookie("darkMode", !isDark);
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
    menuToggleBtn.classList.remove("opened");
    menuToggleBtn.classList.add("closed");
}

function toggleMenu() {
    if (menuToggleBtn.classList.contains("closed")) {
        menuToggleBtn.classList.remove("closed");
        menuToggleBtn.classList.add("opened");
    } else {
        closeMenu();
    }
}

menuToggleBtn.addEventListener("click", e => {
    e.stopPropagation();
    toggleMenu();
});

navLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
});

document.addEventListener("click", e => {
    if (
        !menuToggleBtn.contains(e.target) &&
        !navLinksList.contains(e.target)
    ) {
        closeMenu();
    }
});

function alarmNearEndTask() {
    const uncompletedTasks = tasks
        .filter(task => task.status !== Task.STATUS.COMPLETED)
        .sort(
            (a, b) =>
                new Date(a.dueDate) - new Date(b.dueDate)
        );

    if (!uncompletedTasks.length) return;

    const task = uncompletedTasks[0];
    const oneDay = 1000 * 60 * 60 * 24;

    const daysLeft = Math.ceil(
        (new Date(task.dueDate) - new Date()) / oneDay
    );

    if (daysLeft < 0) {
        alert(`"${task.title}" is overdue!`);

        if (task.priority !== Task.PRIORITY.HIGH) {
            task.priority = Task.PRIORITY.HIGH;
            task.save();
        }
    } else if (daysLeft === 0) {
        alert(`"${task.title}" is due today!`);
    } else if (daysLeft === 1) {
        alert(`"${task.title}" is due tomorrow!`);
    } else {
        alert(`"${task.title}" is due in ${daysLeft} day(s)!`);
    }
}

alarmNearEndTask();

function renderTasks(tasksToRender = tasks) {
    const tasksList = document.getElementById("tasksList");

    if (!tasksToRender.length) {
        tasksList.innerHTML = `
            <li>
                <h1 class="noTasks">No Tasks Were Added</h1>
            </li>
        `;
        return;
    }

    tasksList.innerHTML = tasksToRender
        .map(
            task => `
        <li class="taskItem ${task.priority}">
            <div class="textContainer">
                <div class="text1container">
                    <h3 class="taskTitle">${task.title}</h3>

                    <h4 class="taskDate">
                        ${new Date(task.dueDate).toLocaleDateString()}
                    </h4>
                </div>

                <p class="taskDesc">
                    ${task.description || "No description"}
                </p>

                <small>Status: ${task.status}</small>
            </div>

            <div class="buttonsContainer">
                <button
                    class="ordersBtn"
                    onclick="deleteTask(${task.id})">
                    Delete
                </button>

                <button
                    class="ordersBtn"
                    onclick="openEditModal(${task.id})">
                    Edit
                </button>

                <button
                    class="ordersBtn"
                    onclick="completeTask(${task.id})">
                    Complete
                </button>

                <button
                    class="ordersBtn"
                    onclick="startTask(${task.id})">
                    Start
                </button>
            </div>
        </li>
    `
        )
        .join("");
}

function filterTasks() {
    const query = document
        .getElementById("searchInput")
        .value.toLowerCase()
        .trim();

    if (!query) {
        renderTasks(tasks);
        return;
    }

    renderTasks(
        tasks.filter(
            task =>
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
        )
    );
}

document
    .getElementById("searchInput")
    .addEventListener("input", filterTasks);

document.querySelectorAll(".navLink").forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();

        document
            .querySelectorAll(".navLink")
            .forEach(l => l.classList.remove("active"));

        link.classList.add("active");

        switch (link.getAttribute("href")) {
            case "#pending":
                renderTasks(
                    tasks.filter(
                        t =>
                            t.status !==
                            Task.STATUS.COMPLETED
                    )
                );
                break;

            case "#completed":
                renderTasks(
                    tasks.filter(
                        t =>
                            t.status ===
                            Task.STATUS.COMPLETED
                    )
                );
                break;

            default:
                renderTasks(tasks);
        }

        document.getElementById("searchInput").value = "";
    });
});

document
    .querySelector('.navLink[href="#all"]')
    ?.classList.add("active");

renderTasks();

// ===== Cross-tab Sync =====

window.addEventListener("storage", e => {
    if (e.key !== "tasks") return;

    try {
        tasks = JSON.parse(e.newValue || "[]").map(Task.fromJSON);

        filterTasks();
    } catch (error) {
        console.error("Storage sync failed:", error);
    }
});

// ===== Global Functions =====

window.deleteTask = deleteTask;
window.openEditModal = openEditModal;
window.completeTask = completeTask;
window.startTask = startTask;

function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    task.delete();

    filterTasks();
}

function completeTask(id) {
    const task = tasks.find(t => t.id === id);

    if (!task) return;

    task.complete();

    filterTasks();
}

function startTask(id) {
    const task = tasks.find(t => t.id === id);

    if (!task) return;

    try {
        task.start();
        filterTasks();
    } catch (error) {
        alert(error.message);
    }
}

// ===== Modal =====

function openModal(title = "Add New Task", task = null) {
    const modal = document.getElementById("taskModal");

    modal.style.display = "block";

    document.getElementById("modalTitle").textContent = title;

    if (task) {
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskDescription").value = task.description;
        document.getElementById("taskDueDate").value = task.dueDate;
        document.getElementById("taskPriority").value = task.priority;
        document.getElementById("taskStatus").value = task.status;

        document.getElementById("submitTaskBtn").textContent =
            "Update Task";

        editingTaskId = task.id;
    } else {
        document.getElementById("taskForm").reset();

        document.getElementById("taskPriority").value =
            Task.PRIORITY.MEDIUM;

        document.getElementById("taskStatus").value =
            Task.STATUS.PENDING;

        document.getElementById("submitTaskBtn").textContent =
            "Add Task";

        editingTaskId = null;
    }
}

function closeModal() {
    document.getElementById("taskModal").style.display = "none";

    document.getElementById("taskForm").reset();

    editingTaskId = null;
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);

    if (task) {
        openModal("Edit Task", task);
    }
}

// ===== Modal Events =====

document
    .querySelector(".close-modal")
    .addEventListener("click", closeModal);

window.addEventListener("click", e => {
    if (e.target === document.getElementById("taskModal")) {
        closeModal();
    }
});

document
    .getElementById("addTaskBtn")
    .addEventListener("click", () => openModal());

// ===== Form =====

document
    .getElementById("taskForm")
    .addEventListener("submit", e => {
        e.preventDefault();

        const title =
            document.getElementById("taskTitle").value.trim();

        const description =
            document.getElementById("taskDescription").value.trim();

        const dueDate =
            document.getElementById("taskDueDate").value;

        const priority =
            document.getElementById("taskPriority").value;

        const status =
            document.getElementById("taskStatus").value;

        try {
            if (editingTaskId !== null) {
                const task = tasks.find(
                    t => t.id === editingTaskId
                );

                if (task) {
                    task.edit({
                        title,
                        description,
                        dueDate,
                        priority,
                        status,
                    });
                }
            } else {
                const task = new Task(
                    title,
                    description,
                    dueDate,
                    priority,
                    status
                );

                task.save();
            }

            closeModal();

            filterTasks();
        } catch (error) {
            alert(error.message);
        }
    });

document
    .getElementById("clearTasksBtn")
    .addEventListener("click", () => {
        if (!confirm("Delete all tasks?")) return;

        Task.deleteAll();

        filterTasks();
    });