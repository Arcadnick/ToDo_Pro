document.addEventListener('DOMContentLoaded', () => {

    let editTaskId = null;

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


    //=== ADDtag
    const tagMenu = document.getElementById('tagMenu');
    const addTagWrapper = document.getElementById('addTagWrapper');

    // function generateTagId() {
    //     return Date.now();
    // }

    // function saveTags(tags) {
    //     localStorage.setItem('tags', JSON.stringify(tags));
    // }

    // function loadTags() {
    //     const stored = localStorage.getItem('tags');
    //     return stored ? JSON.parse(stored) : [];
    // }

    // function renderTags() {
    //     const tags = loadTags();
    //     tagMenu.querySelectorAll('.tag-item-wrapper').forEach(el => el.remove());
    //
    //     tags.forEach(tag => {
    //         const wrapper = document.createElement('div');
    //         wrapper.className = 'tag-item-wrapper';
    //
    //         const tagBtn = document.createElement('div');
    //         tagBtn.className = 'tag-item';
    //         tagBtn.textContent = tag.name;
    //         tagBtn.style.backgroundColor = tag.color;
    //         tagBtn.dataset.id = tag.id;
    //
    //         const deleteBtn = document.createElement('span');
    //         deleteBtn.className = 'tag-delete-overlay';
    //         deleteBtn.innerHTML = '✖';
    //         deleteBtn.title = 'Удалить тег';
    //
    //         deleteBtn.addEventListener('click', (e) => {
    //             e.stopPropagation(); // чтобы не сработали другие клики
    //             if (confirm(`Удалить тег "${tag.name}"?`)) {
    //                 const updatedTags = tags.filter(t => t.id !== tag.id);
    //                 saveTags(updatedTags);
    //                 renderTags();
    //                 renderFilterTagOptions();
    //                 renderModalTagCheckboxes();
    //
    //                 // удалить тег из всех задач
    //                 tasks.forEach(task => {
    //                     task.tags = task.tags.filter(id => id != tag.id);
    //                 });
    //                 saveTasks();
    //                 renderTasks();
    //             }
    //         });
    //
    //         wrapper.appendChild(tagBtn);
    //         wrapper.appendChild(deleteBtn);
    //         tagMenu.insertBefore(wrapper, addTagWrapper);
    //     });
    // }
    //
    // function showAddTagForm() {
    //     const form = document.createElement('div');
    //     form.className = 'add-tag-form';
    //     form.innerHTML = `
    //     <input type="text" id="newTagName" maxlength="20" placeholder="Имя">
    //     <input type="color" id="newTagColor" value="#eeeeee">
    //     <button id="confirmAddTag">✔</button>
    //     <button id="cancelAddTag">✖</button>
    // `;
    //
    //     addTagWrapper.replaceChildren(form);
    //
    //     document.getElementById('cancelAddTag').addEventListener('click', () => {
    //         restoreAddTagButton();
    //     });
    //
    //     document.getElementById('confirmAddTag').addEventListener('click', () => {
    //         const name = document.getElementById('newTagName').value.trim();
    //         const color = document.getElementById('newTagColor').value;
    //
    //         if (!name) {
    //             alert('Введите имя тега');
    //             return;
    //         }
    //
    //         const tags = loadTags();
    //         tags.push({
    //             id: generateTagId(),
    //             name: name,
    //             color: color
    //         });
    //
    //         saveTags(tags);
    //         renderTags();
    //         renderFilterTagOptions();
    //         restoreAddTagButton();
    //     });
    // }
    //
    // function restoreAddTagButton() {
    //     addTagWrapper.innerHTML = `<button id="addTagBtn" class="tag-item">+</button>`;
    //     document.getElementById('addTagBtn').addEventListener('click', showAddTagForm);
    // }

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

    // === Отрисовка всех задач ===
    // function renderTasks() {
    //     const container = document.querySelector('.actions');
    //     // Удаляем старые (только задачи, не кнопку "Добавить")
    //     container.querySelectorAll('.actions-item:not(.add-task)').forEach(el => el.remove());
    //
    //     tasks.forEach(task => createTaskElement(task));
    //     updateTaskCount();
    // }

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


    // === Редактирование ===
    let isEditing = false;
    let taskBeingEdited = null;

    function openEditModal(task) {
        isEditing = true;
        taskBeingEdited = task;

        document.getElementById('event-title').value = task.title;
        document.getElementById('event-priority').value = task.priority;
        document.getElementById('event-date').value = task.deadline;
        document.getElementById('event-description').value = task.description;

        openModal();
        renderModalTagCheckboxes();

        const tagCheckboxes = document.querySelectorAll('#taskTagList input');
        tagCheckboxes.forEach(cb => {
            cb.checked = task.tags.includes(cb.value);
        });
    }

    //==
    createEventBtn.addEventListener('click', () => {
        const title = document.getElementById('event-title').value.trim();
        const priority = document.getElementById('event-priority').value;
        const deadline = document.getElementById('event-date').value;
        const description = document.getElementById('event-description').value.trim();
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


