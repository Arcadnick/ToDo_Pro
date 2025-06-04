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

        const tasks = JSON.parse(localStorage.getItem('calendarTasks') || '[]');

        // Название месяца
        const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
        calendarTitle.textContent = `${monthNames[viewMonth]} ${viewYear}`;

        // Заголовок дней недели
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

        // Сетка месяца
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
            const dateStr = cellDate.toISOString().slice(0, 10);

            const label = document.createElement('div');
            label.className = 'date-label';
            label.textContent = dayNum;
            cell.appendChild(label);

            // Подсветка сегодняшнего дня
            const now = new Date();
            if (
                now.getFullYear() === viewYear &&
                now.getMonth() === viewMonth &&
                now.getDate() === dayNum
            ) {
                cell.classList.add('today');
            }

            const dayTasks = tasks.filter(t => t.startDate === dateStr);
            dayTasks.forEach(task => {
                const event = document.createElement('div');
                event.className = 'event-item';
                event.textContent = `${task.start} – ${task.title}`;
                cell.appendChild(event);
            });

            grid.appendChild(cell);
        }

        monthView.appendChild(grid);
    }


    renderMonthView();
});

