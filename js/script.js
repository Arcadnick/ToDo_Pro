document.addEventListener('DOMContentLoaded', () => {

    let editTaskId = null;

    updateTaskCount();

    document.querySelectorAll('.actions-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const item = e.target.closest('.actions-item');
            item.classList.toggle('completed', cb.checked);

            updateTaskCount();
        });
    });

    function updateTaskCount() {
        const tasks = loadTasks();
        const activeTasks = tasks.filter(task => !task.completed).length;

        const taskCountEl = document.getElementById('task-count');
        if (taskCountEl) {
            taskCountEl.textContent = activeTasks;
        }

        const taskCountEl2 = document.getElementById('task-count2');
        if (taskCountEl2) {
            taskCountEl2.textContent = activeTasks;
        }
    }

    document.getElementById('addTaskBtn').addEventListener('click', () => {
        isEditing = false;
        taskBeingEdited = null;
        resetModalFields();
        openModal();
    });

    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const createEventBtn = document.getElementById('create-event');

    modalOverlay.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    function openModal() {
        modal.classList.add('show');
        modalOverlay.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('show');
        modalOverlay.classList.remove('active');
        resetModalFields();
    }

    function resetModalFields() {
        document.getElementById('event-title').value = '';
        document.getElementById('event-priority').value = '';
        document.getElementById('event-date').value = '';
        document.getElementById('event-description').value = '';
        document.getElementById('taskTagList').innerHTML = '';
        renderModalTagCheckboxes();
    }


    const tagMenu = document.getElementById('tagMenu');
    const addTagWrapper = document.getElementById('addTagWrapper');

    restoreAddTagButton();
    renderTags();

    function renderModalTagCheckboxes() {
        const tagContainer = document.getElementById('taskTagList');
        tagContainer.innerHTML = ''; // очищаем

        const tags = loadTags();
        tags.forEach(tag => {
            const label = document.createElement('label');
            label.className = 'tag-checkbox';
            label.style.backgroundColor = tag.color;

            label.innerHTML = `
            <input type="checkbox" value="${tag.id}">
            ${tag.name}
        `;

            tagContainer.appendChild(label);
        });
    }

    let tasks = loadTasks();
    renderTasks();

    renderFilterTagOptions();
    setupFilters();

    function renderFilterTagOptions() {
        const tagSelect = document.getElementById('filterTag');
        const tags = loadTags();

        tagSelect.innerHTML = `<option value="">Все теги</option>`;
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.name;
            tagSelect.appendChild(option);
        });
    }

    function setupFilters() {
        document.getElementById('filterStatus').addEventListener('change', renderTasks);
        document.getElementById('filterPriority').addEventListener('change', renderTasks);
        document.getElementById('filterTag').addEventListener('change', renderTasks);
        document.getElementById('sortBy').addEventListener('change', renderTasks);
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const stored = localStorage.getItem('tasks');
        return stored ? JSON.parse(stored) : [];
    }

    function createTaskElement(task) {
        const newTask = document.createElement('div');
        newTask.classList.add('actions-item');
        if (task.completed) newTask.classList.add('completed');

        const id = 'task' + task.id;

        newTask.innerHTML = `
        <input type="checkbox" id="${id}" ${task.completed ? 'checked' : ''}>
        <label for="${id}">${task.title}</label>
        <div class="action-description">
            📅 ${task.deadline} · 🏷️ ${task.tags.length ? task.tags.map(id => {
            const tag = loadTags().find(t => t.id == id);
            return tag ? tag.name : '(?)';
        }).join(', ') : 'Без тегов'}
 · 🔥 ${task.priority}
        </div>
        <button class="edit-btn" title="Редактировать">✏</button>
        <button class="delete-btn" title="Удалить">✖</button>
    `;

        const checkbox = newTask.querySelector('input');
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            newTask.classList.toggle('completed', task.completed);
            saveTasks();
            updateTaskCount();
        });

        const deleteBtn = newTask.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            if (confirm('Удалить эту задачу?')) {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                newTask.remove();
                updateTaskCount();
            }
        });

        const editBtn = newTask.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            openEditModal(task);
        });

        document.querySelector('.actions').appendChild(newTask);
    }

    function renderTasks() {
        const container = document.querySelector('.actions');
        container.querySelectorAll('.actions-item:not(.add-task)').forEach(el => el.remove());

        let filtered = [...tasks];

        const status = document.getElementById('filterStatus').value;
        const priority = document.getElementById('filterPriority').value;
        const tag = document.getElementById('filterTag').value;
        const sort = document.getElementById('sortBy').value;

        if (status === 'active') filtered = filtered.filter(t => !t.completed);
        else if (status === 'completed') filtered = filtered.filter(t => t.completed);

        if (priority) filtered = filtered.filter(t => t.priority === priority);
        if (tag) filtered = filtered.filter(t => t.tags.includes(tag));

        if (sort === 'deadline') {
            filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        } else if (sort === 'priority') {
            const order = { high: 3, medium: 2, low: 1 };
            filtered.sort((a, b) => order[b.priority] - order[a.priority]);
        }

        filtered.forEach(task => createTaskElement(task));
        updateTaskCount();
    }

    let isEditing = false;
    let taskBeingEdited = null;

    function openEditModal(task) {
        isEditing = true;
        taskBeingEdited = task;

        document.getElementById('event-title').value = task.title;
        document.getElementById('event-priority').value = task.priority;
        document.getElementById('event-date').value = task.deadline;
        document.getElementById('event-description').value = task.description;
        document.getElementById('event-start').value = task.startTime;
        document.getElementById('event-duration').value = task.duration;

        openModal();
        renderModalTagCheckboxes();

        const tagCheckboxes = document.querySelectorAll('#taskTagList input');
        tagCheckboxes.forEach(cb => {
            cb.checked = task.tags.includes(cb.value);
        });
    }

    createEventBtn.addEventListener('click', () => {
        const title = document.getElementById('event-title').value.trim();
        const priority = document.getElementById('event-priority').value;
        const deadline = document.getElementById('event-date').value;
        const description = document.getElementById('event-description').value.trim();
        const startTime = document.getElementById('event-start').value;
        const duration = parseInt(document.getElementById('event-duration').value) || 60;
        const selectedTags = [...document.querySelectorAll('#taskTagList input:checked')]
            .map(cb => cb.value);


        if (!title || !priority || !deadline) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        if (isEditing && taskBeingEdited) {
            taskBeingEdited.title = title;
            taskBeingEdited.priority = priority;
            taskBeingEdited.deadline = deadline;
            taskBeingEdited.description = description;
            taskBeingEdited.tags = selectedTags;
            taskBeingEdited.startTime = startTime;
            taskBeingEdited.duration = duration;

            saveTasks();
            renderTasks();
        } else {
            const newTaskObj = {
                id: Date.now(),
                title,
                priority,
                deadline,
                description,
                tags: selectedTags,
                startTime,
                duration,
                completed: false
            };

            tasks.push(newTaskObj);
            saveTasks();
            createTaskElement(newTaskObj);
        }

        closeModal();
        updateTaskCount();
    });

    document.getElementById('filterToggle').addEventListener('click', () => {
        const menu = document.getElementById('filterMenu');
        menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
    });

// закрывать при клике вне меню
    document.addEventListener('click', (e) => {
        const toggle = document.getElementById('filterToggle');
        const menu = document.getElementById('filterMenu');
        if (!toggle.contains(e.target) && !menu.contains(e.target)) {
            menu.style.display = 'none';
        }
    });

});


