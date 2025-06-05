document.addEventListener('DOMContentLoaded', () => {
    const todayList = document.getElementById('todayTaskList');
    const today = new Date().toISOString().split('T')[0];
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const todayTasks = tasks.filter(t => t.deadline === today);
    const taskCount = document.getElementById('task-count2');

    updateTodayCount?.();


    function renderModalTagCheckboxes() {
        const tagContainer = document.getElementById('taskTagList');
        tagContainer.innerHTML = '';

        const tags = JSON.parse(localStorage.getItem('tags') || '[]');
        tags.forEach(tag => {
            const label = document.createElement('label');
            label.className = 'tag-checkbox';
            label.style.backgroundColor = tag.color;
            label.innerHTML = `
                <input type="checkbox" value="${tag.id}"> ${tag.name}
            `;
            tagContainer.appendChild(label);
        });
    }

    function openModal(task) {
        document.getElementById('event-title').value = task.title;
        document.getElementById('event-priority').value = task.priority;
        document.getElementById('event-date').value = task.deadline;
        document.getElementById('event-description').value = task.description;
        document.getElementById('event-start').value = task.startTime;
        document.getElementById('event-duration').value = task.duration;

        renderModalTagCheckboxes();

        const checkboxes = document.querySelectorAll('#taskTagList input');
        checkboxes.forEach(cb => {
            cb.checked = task.tags.includes(cb.value);
        });

        window.editingTaskId = task.id;
        document.getElementById('modal').classList.add('show');
        document.getElementById('modalOverlay').classList.add('active');
    }

    document.getElementById('modalOverlay').addEventListener('click', closeModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    function closeModal() {
        document.getElementById('modal').classList.remove('show');
        document.getElementById('modalOverlay').classList.remove('active');
        window.editingTaskId = null;
    }

    document.getElementById('create-event').addEventListener('click', () => {
        const title = document.getElementById('event-title').value.trim();
        const deadline = document.getElementById('event-date').value;
        const priority = document.getElementById('event-priority').value;
        const startTime = document.getElementById('event-start').value;
        const duration = parseInt(document.getElementById('event-duration').value) || 60;
        const description = document.getElementById('event-description').value.trim();
        const selectedTags = [...document.querySelectorAll('#taskTagList input:checked')].map(cb => cb.value);

        if (!title || !priority || !deadline) {
            alert('Заполните все обязательные поля');
            return;
        }

        const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const updated = allTasks.map(t => {
            if (t.id === window.editingTaskId) {
                return { ...t, title, deadline, priority, startTime, duration, description, tags: selectedTags };
            }
            return t;
        });

        localStorage.setItem('tasks', JSON.stringify(updated));
        updateTodayCount?.();
        closeModal();
        location.reload();
    });

    todayTasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'actions-item';
        if (task.completed) div.classList.add('completed');

        const id = 'today-task-' + task.id;

        const tagNames = task.tags.map(id => {
            const allTags = JSON.parse(localStorage.getItem('tags') || '[]');
            const found = allTags.find(t => t.id == id);
            return found ? found.name : '(?)';
        }).join(', ');

        div.innerHTML = `
        <input type="checkbox" id="${id}" ${task.completed ? 'checked' : ''}>
        <label for="${id}">${task.title}</label>
        <div class="action-description">
            ⏰ ${task.startTime || '–'} · 🏷️ ${tagNames || 'Без тегов'} · 🔥 ${task.priority}
        </div>
        <button class="edit-btn">✏</button>
        <button class="delete-btn">✖</button>
    `;

        // Обработка чекбокса
        const checkbox = div.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            if (task.completed) div.classList.add('completed');
            else div.classList.remove('completed');

            const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const updated = allTasks.map(t => t.id === task.id ? task : t);
            localStorage.setItem('tasks', JSON.stringify(updated));
            updateTodayCount?.();
        });

        // Редактирование
        div.querySelector('.edit-btn').addEventListener('click', () => openModal(task));

        // Удаление
        div.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm('Удалить задачу?')) {
                const newTasks = tasks.filter(t => t.id !== task.id);
                localStorage.setItem('tasks', JSON.stringify(newTasks));
                updateTodayCount?.();
                location.reload();
            }
        });

        todayList.appendChild(div);
    });

    const searchInput = document.getElementById('taskSearchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const today = new Date().toISOString().split('T')[0];

        const matched = allTasks.filter(t =>
            t.deadline === today &&
            !t.completed &&
            t.title.toLowerCase().includes(query)
        );

        if (!query || matched.length === 0) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
            return;
        }

        searchResults.innerHTML = '';
        matched.slice(0, 10).forEach(task => {
            const item = document.createElement('div');
            item.textContent = `${task.title} (${task.startTime || '–'})`;
            item.addEventListener('click', () => {
                openModal(task);
                searchResults.style.display = 'none';
                searchInput.value = '';
            });
            searchResults.appendChild(item);
        });

        searchResults.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

});
