document.addEventListener('DOMContentLoaded', () => {
    const monthView = document.getElementById('monthView');
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modalOverlay');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const createEventBtn = document.getElementById('create-event');

    updateTodayCount?.();

    restoreAddTagButton('addTagWrapper', () => renderTags('tagMenu', 'addTagWrapper'), 'tagMenu');
    renderTags('tagMenu', 'addTagWrapper');

    openModalBtn.addEventListener('click', () => {
        modal.classList.add('show');
        modalOverlay.classList.add('active');
        renderModalTagCheckboxes();
    });

    modalOverlay.addEventListener('click', closeModal);

    closeModalBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('show');
        modalOverlay.classList.remove('active');
        window.editingTaskId = null;
    }

    createEventBtn.addEventListener('click', () => {
        const title = document.getElementById('event-title').value.trim();
        const deadline = document.getElementById('event-date').value;
        const startTime = document.getElementById('event-start').value;
        const duration = parseInt(document.getElementById('event-duration').value) || 60;
        const priority = document.getElementById('event-priority').value;
        const description = document.getElementById('event-description').value.trim();
        const selectedTags = [...document.querySelectorAll('#taskTagList input:checked')].map(cb => cb.value);

        if (!title || !priority || !deadline) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

        if (window.editingTaskId) {
            const updatedTasks = tasks.map(t => {
                if (t.id === window.editingTaskId) {
                    return {
                        ...t,
                        title,
                        deadline,
                        startTime,
                        duration,
                        priority,
                        description,
                        tags: selectedTags
                    };
                }
                return t;
            });
            localStorage.setItem('tasks', JSON.stringify(updatedTasks));
            window.editingTaskId = null;
        } else {
            // Новая задача
            const task = {
                id: Date.now(),
                title,
                deadline,
                startTime,
                duration,
                priority,
                description,
                tags: selectedTags,
                completed: false
            };
            tasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        closeModal();
        renderMonthView();
    });

    let viewYear = new Date().getFullYear();
    let viewMonth = new Date().getMonth();

    document.getElementById('prevMonthBtn').addEventListener('click', () => {
        viewMonth--;
        if (viewMonth < 0) {
            viewMonth = 11;
            viewYear--;
        }
        renderMonthView();
    });

    document.getElementById('nextMonthBtn').addEventListener('click', () => {
        viewMonth++;
        if (viewMonth > 11) {
            viewMonth = 0;
            viewYear++;
        }
        renderMonthView();
    });

    function renderMonthView() {
        const monthView = document.getElementById('monthView');
        const calendarTitle = document.getElementById('calendarTitle');

        monthView.innerHTML = '';

        const firstDay = new Date(viewYear, viewMonth, 1);
        const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
        const startWeekDay = (firstDay.getDay() + 6) % 7;

        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

        const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
        calendarTitle.textContent = `${monthNames[viewMonth]} ${viewYear}`;

        const weekNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        const weekRow = document.createElement('div');
        weekRow.className = 'weekdays';
        weekNames.forEach(day => {
            const el = document.createElement('div');
            el.className = 'weekday';
            el.textContent = day;
            weekRow.appendChild(el);
        });
        monthView.appendChild(weekRow);

        const grid = document.createElement('div');
        grid.className = 'month-grid';

        for (let i = 0; i < startWeekDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'day-cell';
            empty.style.visibility = 'hidden';
            grid.appendChild(empty);
        }

        for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';

            const cellDate = new Date(viewYear, viewMonth, dayNum);
            const dateStr = cellDate.getFullYear() + '-' +
                String(cellDate.getMonth() + 1).padStart(2, '0') + '-' +
                String(cellDate.getDate()).padStart(2, '0');


            const label = document.createElement('div');
            label.className = 'date-label';
            label.textContent = dayNum;
            label.style.cursor = 'pointer';
            label.textContent = dayNum;
            cell.appendChild(label);

            cell.style.cursor = 'pointer';
            cell.addEventListener('click', () => {
                openDayModal(dateStr, `${dayNum}.${viewMonth + 1}.${viewYear}`);
            });

            cell.appendChild(label);

            const now = new Date();
            if (
                now.getFullYear() === viewYear &&
                now.getMonth() === viewMonth &&
                now.getDate() === dayNum
            ) {
                cell.classList.add('today');
            }

            const dayTasks = tasks.filter(t => t.deadline === dateStr);
            dayTasks.forEach(task => {
                const event = document.createElement('div');
                event.className = 'event-item';
                console.log(task);
                event.textContent = `${task.startTime} – ${task.title}`;
                cell.appendChild(event);
            });

            grid.appendChild(cell);
        }

        monthView.appendChild(grid);
    }

    const dayModal = document.getElementById('dayModal');
    const dayModalOverlay = document.getElementById('dayModalOverlay');
    const closeDayModalBtn = document.getElementById('closeDayModalBtn');
    const dayTaskList = document.getElementById('dayTaskList');
    const dayModalTitle = document.getElementById('dayModalTitle');

    closeDayModalBtn.addEventListener('click', () => {
        dayModal.classList.remove('show');
        dayModalOverlay.classList.remove('active');
    });

    dayModalOverlay.addEventListener('click', () => {
        dayModal.classList.remove('show');
        dayModalOverlay.classList.remove('active');
    });

    function openDayModal(dateStr, readableDate) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const filtered = tasks.filter(t => t.deadline === dateStr);

        dayModalTitle.textContent = `Задачи на ${readableDate}`;
        dayTaskList.innerHTML = '';

        if (filtered.length === 0) {
            dayTaskList.innerHTML = '<p>Нет задач</p>';
        } else {
            filtered.forEach((task, index) => {
                const div = document.createElement('div');
                div.className = 'day-task';
                div.innerHTML = `
                    <span>${task.startTime} – ${task.title}</span>
                    <button class="edit" title="Редактировать">✏</button>
                    <button class="delete" title="Удалить">✖</button>
                `;

                div.querySelector('.delete').onclick = () => {
                    const updated = tasks.filter(t => t.id !== task.id);
                    localStorage.setItem('tasks', JSON.stringify(updated));
                    openDayModal(dateStr, readableDate);
                    renderMonthView();
                };

                div.querySelector('.edit').onclick = () => {
                    document.getElementById('event-title').value = task.title;
                    document.getElementById('event-priority').value = task.priority;
                    document.getElementById('event-date').value = task.deadline;
                    document.getElementById('event-description').value = task.description;
                    document.getElementById('event-start').value = task.startTime;
                    document.getElementById('event-duration').value = task.duration;

                    const tagCheckboxes = document.querySelectorAll('#taskTagList input');
                    tagCheckboxes.forEach(cb => {
                        cb.checked = task.tags.includes(cb.value);
                    });

                    window.editingTaskId = task.id;

                    modal.classList.add('show');
                    modalOverlay.classList.add('active');
                    dayModal.classList.remove('show');
                    dayModalOverlay.classList.remove('active');
                };

                dayTaskList.appendChild(div);
            });
        }

        dayModal.classList.add('show');
        dayModalOverlay.classList.add('active');
    }

    renderMonthView();

    function renderModalTagCheckboxes() {
        const tagContainer = document.getElementById('taskTagList');
        tagContainer.innerHTML = '';

        const tags = JSON.parse(localStorage.getItem('tags') || '[]');
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

    const searchInput = document.getElementById('taskSearchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');

        if (!query) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
            return;
        }

        const matched = allTasks.filter(task => task.title.toLowerCase().includes(query));

        if (matched.length === 0) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
            return;
        }

        searchResults.innerHTML = '';
        matched.slice(0, 10).forEach(task => {
            const item = document.createElement('div');
            item.textContent = `${task.title} (${task.deadline})`;
            item.addEventListener('click', () => {
                document.getElementById('event-title').value = task.title;
                document.getElementById('event-priority').value = task.priority;
                document.getElementById('event-date').value = task.deadline;
                document.getElementById('event-description').value = task.description;
                document.getElementById('event-start').value = task.startTime;
                document.getElementById('event-duration').value = task.duration;

                const tagCheckboxes = document.querySelectorAll('#taskTagList input');
                tagCheckboxes.forEach(cb => {
                    cb.checked = task.tags.includes(cb.value);
                });

                window.editingTaskId = task.id;

                document.getElementById('modal').classList.add('show');
                document.getElementById('modalOverlay').classList.add('active');

                searchResults.style.display = 'none';
                searchResults.innerHTML = '';
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

