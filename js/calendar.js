document.addEventListener('DOMContentLoaded', () => {
    const monthView = document.getElementById('monthView');
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modalOverlay');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const createEventBtn = document.getElementById('create-event');

    // Открытие модалки
    openModalBtn.addEventListener('click', () => {
        modal.classList.add('show');
        modalOverlay.classList.add('active');
    });

    // Закрытие по затемнению
    modalOverlay.addEventListener('click', closeModal);

    // Закрытие по кнопке ×
    closeModalBtn.addEventListener('click', closeModal);

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('show');
        modalOverlay.classList.remove('active');
    }

    // Добавление задачи
    createEventBtn.addEventListener('click', () => {
        const title = document.getElementById('event-title').value.trim();
        const startDate = document.getElementById('event-date').value;
        const start = document.getElementById('event-start').value;
        const duration = parseInt(document.getElementById('event-duration').value) || 60;

        if (!title || !start || !startDate) {
            alert('Введите все данные');
            return;
        }

        const task = { title, start, duration, startDate };
        const tasks = JSON.parse(localStorage.getItem('calendarTasks') || '[]');
        tasks.push(task);
        localStorage.setItem('calendarTasks', JSON.stringify(tasks));

        closeModal();
        document.getElementById('event-title').value = '';
        document.getElementById('event-date').value = '';
        document.getElementById('event-start').value = '';
        document.getElementById('event-duration').value = 60;

        renderMonthView();
    });

    // Отрисовка месяца
    function renderMonthView() {
        monthView.innerHTML = '';

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const firstWeekDay = (firstDay.getDay() + 6) % 7;
        const totalDays = lastDay.getDate();
        const totalCells = firstWeekDay + totalDays;
        const rows = Math.ceil(totalCells / 7);

        const tasks = JSON.parse(localStorage.getItem('calendarTasks') || '[]');
        const grid = document.createElement('div');
        grid.className = 'month-grid';

        for (let i = 0; i < rows * 7; i++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';

            const dayNum = i - firstWeekDay + 1;

            if (i >= firstWeekDay && dayNum <= totalDays) {
                const date = new Date(year, month, dayNum);
                const dateStr = date.toISOString().slice(0, 10);

                const label = document.createElement('div');
                label.className = 'date-label';
                label.textContent = dayNum;
                cell.appendChild(label);

                const dayTasks = tasks.filter(task => task.startDate === dateStr);
                dayTasks.forEach(task => {
                    const event = document.createElement('div');
                    event.className = 'event-item';
                    event.textContent = `${task.start} – ${task.title}`;
                    cell.appendChild(event);
                });
            }

            grid.appendChild(cell);
        }

        monthView.appendChild(grid);
    }

    renderMonthView();
});

