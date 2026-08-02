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

        localStorage.setItem("tasks", JSON.stringify(tasks));
    }
}

const form = document.getElementById("taskForm");
const tasksContainer = document.getElementById("tasksContainer");

function renderTasks() {
    tasksContainer.innerHTML = "";

    tasks.forEach(task => {
        tasksContainer.innerHTML += `
            <article class="task">
                <h3>${task.title}</h3>

                <p>${task.description}</p>

                <p>
                    <strong>Due Date:</strong>
                    ${new Date(task.dueDate).toLocaleDateString()}
                </p>

                <p>
                    <strong>Priority:</strong>
                    ${task._priority}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${task._status}
                </p>

                <button class="edit-btn" data-id="${task.id}">
                    Edit
                </button>

                <button class="delete-btn" data-id="${task.id}">
                    Delete
                </button>

                <button class="start-btn" data-id="${task.id}">
                    Start
                </button>

                <button class="complete-btn" data-id="${task.id}">
                    Complete
                </button>

                <hr>
            </article>
        `;
    });
}

renderTasks();

form.addEventListener("submit", (e) => {
    e.preventDefault();

    new Task(
        title.value,
        description.value,
        new Date(dueDate.value),
        priority.value
    );

    form.reset();

    renderTasks();
});

tasksContainer.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.id);

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    if (e.target.classList.contains("delete-btn")) {
        if (!confirm(`Delete "${task.title}"?`)) {
            return;
        }

        tasks = tasks.filter(task => task.id !== id);

        localStorage.setItem("tasks", JSON.stringify(tasks));

        renderTasks();
    }

    if (e.target.classList.contains("start-btn")) {
        task._status = Task.STATUS.IN_PROGRESS;

        localStorage.setItem("tasks", JSON.stringify(tasks));

        renderTasks();
    }

    if (e.target.classList.contains("complete-btn")) {
        task._status = Task.STATUS.COMPLETED;

        localStorage.setItem("tasks", JSON.stringify(tasks));

        renderTasks();
    }

    if (e.target.classList.contains("edit-btn")) {
        const newTitle = prompt("Title", task.title);

        if (newTitle === null) {
            return;
        }

        const newDescription = prompt(
            "Description",
            task.description
        );

        if (newDescription === null) {
            return;
        }

        task.title = newTitle;
        task.description = newDescription;

        localStorage.setItem("tasks", JSON.stringify(tasks));

        renderTasks();
    }
});

window.addEventListener("storage", (event) => {
    if (event.key === "tasks") {
        tasks = JSON.parse(event.newValue) || [];

        renderTasks();
    }

    if (event.key === "taskIdCounter") {
        Task.idCounter = Number(event.newValue) || 1;
    }
});