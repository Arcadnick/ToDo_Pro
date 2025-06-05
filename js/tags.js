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

function renderTags(tagMenuId = 'tagMenu', addWrapperId = 'addTagWrapper', onUpdate = () => {}) {
    const tagMenu = document.getElementById(tagMenuId);
    const addTagWrapper = document.getElementById(addWrapperId);
    const tags = loadTags();

    tagMenu.querySelectorAll('.tag-item-wrapper').forEach(el => el.remove());

    tags.forEach(tag => {
        const wrapper = document.createElement('div');
        wrapper.className = 'tag-item-wrapper';

        const tagBtn = document.createElement('div');
        tagBtn.className = 'tag-item';
        tagBtn.textContent = tag.name;
        tagBtn.style.backgroundColor = tag.color;
        tagBtn.dataset.id = tag.id;

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'tag-delete-overlay';
        deleteBtn.innerHTML = '✖';
        deleteBtn.title = 'Удалить тег';

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Удалить тег "${tag.name}"?`)) {
                const updatedTags = tags.filter(t => t.id !== tag.id);
                saveTags(updatedTags);

                // Удалить тег из всех задач
                const tasks = loadTasks();
                tasks.forEach(task => {
                    task.tags = task.tags ? task.tags.filter(id => id != tag.id) : [];
                });
                saveTasks(tasks);

                renderTags(tagMenuId, addWrapperId, onUpdate);
                onUpdate();
            }
        });


        wrapper.appendChild(tagBtn);
        wrapper.appendChild(deleteBtn);
        tagMenu.insertBefore(wrapper, addTagWrapper);
    });
}

function showAddTagForm(addTagWrapperId = 'addTagWrapper', onUpdate = () => {}, tagMenuId = 'tagMenu') {
    const addTagWrapper = document.getElementById(addTagWrapperId);

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
        restoreAddTagButton(addTagWrapperId, onUpdate, tagMenuId);
    });

    document.getElementById('confirmAddTag').addEventListener('click', () => {
        const name = document.getElementById('newTagName').value.trim();
        const color = document.getElementById('newTagColor').value;

        if (!name) {
            alert('Введите имя тега');
            return;
        }

        const tags = loadTags();
        tags.push({ id: generateTagId(), name, color });

        saveTags(tags);
        renderTags(tagMenuId, addTagWrapperId, onUpdate);
        restoreAddTagButton(addTagWrapperId, onUpdate, tagMenuId);
        onUpdate();
    });
}

function restoreAddTagButton(addTagWrapperId = 'addTagWrapper', onUpdate = () => {}, tagMenuId = 'tagMenu') {
    const addTagWrapper = document.getElementById(addTagWrapperId);
    addTagWrapper.innerHTML = `<button id="addTagBtn" class="tag-item">+</button>`;
    document.getElementById('addTagBtn').addEventListener('click', () => {
        showAddTagForm(addTagWrapperId, onUpdate, tagMenuId);
    });
}

function loadTasks() {
    const stored = localStorage.getItem('tasks');
    return stored ? JSON.parse(stored) : [];
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTodayCount() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayCount = tasks.filter(t => t.deadline === today && !t.completed).length;

    const el = document.getElementById('task-count3');
    if (el) el.textContent = todayCount;
}
