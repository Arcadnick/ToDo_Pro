document.addEventListener('DOMContentLoaded', () => {

    updateTaskCount();

    // Обработка чекбоксов
    document.querySelectorAll('.actions-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const item = e.target.closest('.actions-item');
            item.classList.toggle('completed', cb.checked);

            updateTaskCount();
        });
    });

    //счетчик задач на Сегодня
    function updateTaskCount() {
        const tasks = loadTasks(); // грузим из localStorage
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

    //модальное окно
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');

    document.getElementById('addTaskBtn').addEventListener('click', () => {
        modal.classList.add('active');
        renderModalTagCheckboxes();
    });


    document.getElementById('cancelModal').addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('taskTitle').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const deadline = document.getElementById('taskDeadline').value;
        const description = document.getElementById('taskDescription').value.trim();
        const selectedTags = [...document.querySelectorAll('#taskTagList input:checked')]
            .map(cb => cb.value);

        if (!title || !priority || !deadline) {
            alert('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        const newTaskObj = {
            id: Date.now(),
            title,
            priority,
            deadline,
            description,
            tags: selectedTags,
            completed: false
        };

        tasks.push(newTaskObj);
        saveTasks();
        createTaskElement(newTaskObj);

        form.reset();
        modal.classList.remove('active');
        updateTaskCount();
    });

    //=== ADDtag
    const tagMenu = document.getElementById('tagMenu');
    const addTagWrapper = document.getElementById('addTagWrapper');

    function generateTagId() {
        return Date.now();
    }

    function saveTags(tags) {
        localStorage.setItem('tags', JSON.stringify(tags));
    }

    function loadTags() {
        const stored = localStorage.getItem('tags');
        return stored ? JSON.parse(stored) : [];
    }

    function renderTags() {
        const tags = loadTags();
        tagMenu.querySelectorAll('.tag-item[data-id]').forEach(el => el.remove());

        tags.forEach(tag => {
            const tagBtn = document.createElement('button');
            tagBtn.className = 'tag-item';
            tagBtn.textContent = tag.name;
            tagBtn.style.backgroundColor = tag.color;
            tagBtn.dataset.id = tag.id;
            tagMenu.insertBefore(tagBtn, addTagWrapper);
        });
    }

    function showAddTagForm() {
        const form = document.createElement('div');
        form.className = 'add-tag-form';
        form.innerHTML = `
        <input type="text" id="newTagName" maxlength="20" placeholder="Имя">
        <input type="color" id="newTagColor" value="#eeeeee">
        <button id="confirmAddTag">✔</button>
        <button id="cancelAddTag">✖</button>
    `;

        addTagWrapper.replaceChildren(form);

        document.getElementById('cancelAddTag').addEventListener('click', () => {
            restoreAddTagButton();
        });

        document.getElementById('confirmAddTag').addEventListener('click', () => {
            const name = document.getElementById('newTagName').value.trim();
            const color = document.getElementById('newTagColor').value;

            if (!name) {
                alert('Введите имя тега');
                return;
            }

            const tags = loadTags();
            tags.push({
                id: generateTagId(),
                name: name,
                color: color
            });

            saveTags(tags);
            renderTags();
            restoreAddTagButton();
        });
    }

    function restoreAddTagButton() {
        addTagWrapper.innerHTML = `<button id="addTagBtn" class="tag-item">+</button>`;
        document.getElementById('addTagBtn').addEventListener('click', showAddTagForm);
    }

    restoreAddTagButton();
    renderTags();

    //===tagcheckbox
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

// === Хранилище задач ===
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const stored = localStorage.getItem('tasks');
        return stored ? JSON.parse(stored) : [];
    }

// === Создание DOM-элемента задачи ===
    function createTaskElement(task) {
        const newTask = document.createElement('div');
        newTask.classList.add('actions-item');
        if (task.completed) newTask.classList.add('completed');

        const id = 'task' + task.id;

        newTask.innerHTML = `
        <input type="checkbox" id="${id}" ${task.completed ? 'checked' : ''}>
        <label for="${id}">${task.title}</label>
        <div class="action-description">
            📅 ${task.deadline} · 🏷️ ${task.tags.length ? task.tags.join(', ') : 'Без тегов'} · 🔥 ${task.priority}
        </div>
    `;

        const checkbox = newTask.querySelector('input');
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            newTask.classList.toggle('completed', task.completed);
            saveTasks();
            updateTaskCount();
        });

        document.querySelector('.actions').appendChild(newTask);
    }

// === Отрисовка всех задач ===
    function renderTasks() {
        const container = document.querySelector('.actions');
        // Удаляем старые (только задачи, не кнопку "Добавить")
        container.querySelectorAll('.actions-item:not(.add-task)').forEach(el => el.remove());

        tasks.forEach(task => createTaskElement(task));
        updateTaskCount();
    }

});


