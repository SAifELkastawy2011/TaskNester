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

    constructor(title, description, dueDate, priority, status = Task.STATUS.PENDING) {
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

    complete() {
        this.status = Task.STATUS.COMPLETED;
        this.save();
    }

    start() {
        this.status = Task.STATUS.IN_PROGRESS;
        this.save();
    }

    delete() {
        if (!confirm(`Are you sure you want to delete "${this.title}"?`)) {
            return;
        }

        const index = tasks.findIndex(task => task.id === this.id);

        if (index !== -1) {
            tasks.splice(index, 1);
            localStorage.setItem("tasks", JSON.stringify(tasks));
        }
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


window.addEventListener("storage", (event) => {
    if (event.key === "tasks") {
        tasks = JSON.parse(event.newValue) || [];
        console.log("Tasks updated from another tab:", tasks);
    }

    if (event.key === "taskIdCounter") {
        Task.idCounter = Number(event.newValue) || 1;
    }
});