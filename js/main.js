document.addEventListener("DOMContentLoaded", () => {
    fetchTasks();

    document.getElementById("task-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("task-title").value.trim();
        const priority = document.querySelector("input[name='priority']:checked")?.value;
        const deadline = document.getElementById("task-deadline").value;
        const category = document.getElementById("task-category").value;

        if (!title || !priority || !deadline) {
            return alert("Заполните все поля!");
        }

        const res = await fetch("api/api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, priority, deadline, category })
        });

        const newTask = await res.json();
        renderTask(newTask);
        e.target.reset();
    });
});

async function fetchTasks() {
    const res = await fetch("api/api.php");
    const tasks = await res.json();
    tasks.forEach(renderTask);
}

function renderTask(task) {
    const container = document.getElementById("task-list");
    const el = document.createElement("div");
    el.className = "task-card";
    el.innerHTML = `
    <h3>${task.title}</h3>
    <p>Приоритет: ${task.priority}</p>
    <p>Срок: ${new Date(task.deadline).toLocaleDateString()}</p>
    <p>Категория: ${task.category}</p>
    <button onclick="deleteTask(${task.id})">Удалить</button>
  `;
    container.appendChild(el);
}

async function deleteTask(id) {
    const res = await fetch("api/api.php", {
        method: "DELETE",
        body: new URLSearchParams({ id })
    });

    if (res.ok) {
        document.querySelector(`[onclick="deleteTask(${id})"]`).parentElement.remove();
    }
}
