document.addEventListener('DOMContentLoaded', () => {
    const viewButtons = document.querySelectorAll('.calendar-controls button[data-view]');
    const panels = {
        day: document.getElementById('dayView'),
        week: document.getElementById('weekView'),
        month: document.getElementById('monthView')
    };

    // Переключение вида
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.calendar-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.calendar-controls button').forEach(b => b.classList.remove('active'));

            btn.classList.add('active');
            const view = btn.dataset.view;
            panels[view].classList.add('active');
        });
    });

    // Отрисовать DAY
    for (let h = 0; h < 24; h++) {
        const div = document.createElement('div');
        div.className = 'time-line';
        div.style.top = `${h * 60}px`;
        div.textContent = `${h.toString().padStart(2, '0')}:00`;
        panels.day.appendChild(div);
    }

    // Отрисовать WEEK
    const weekTime = document.createElement('div');
    weekTime.className = 'week-time';
    for (let h = 0; h < 24; h++) {
        const t = document.createElement('div');
        t.textContent = `${h.toString().padStart(2, '0')}:00`;
        weekTime.appendChild(t);
    }
    panels.week.appendChild(weekTime);

    for (let i = 0; i < 7; i++) {
        const day = document.createElement('div');
        day.className = 'week-day';
        panels.week.appendChild(day);
    }

    // Отрисовать MONTH
    for (let i = 1; i <= 42; i++) {
        const day = document.createElement('div');
        day.className = 'month-day';
        day.textContent = i <= 31 ? i : '';
        panels.month.appendChild(day);
    }

    // Модалка
    const modal = document.getElementById('modal');
    document.getElementById('openModalBtn').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    document.getElementById('create-event').addEventListener('click', () => {
        const title = document.getElementById('event-title').value;
        const start = document.getElementById('event-start').value;
        const duration = parseInt(document.getElementById('event-duration').value, 10);

        if (!title || !start || isNaN(duration)) return;

        const [h, m] = start.split(':').map(Number);
        const top = (h * 60 + m);
        const height = duration;

        const div = document.createElement('div');
        div.className = 'event';
        div.style.top = `${top}px`;
        div.style.height = `${height}px`;
        div.textContent = title;

        panels.day.appendChild(div);
        modal.classList.add('hidden');
    });
});