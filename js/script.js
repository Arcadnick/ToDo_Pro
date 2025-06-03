document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        alert('Добавление новой задачи...');
        // TODO: показать форму или модальное окно
    });

    document.getElementById('addListBtn').addEventListener('click', () => {
        alert('Добавить новый список...');
    });

    document.getElementById('addTagBtn').addEventListener('click', () => {
        alert('Добавить новый тэг...');
    });

    // Пример обработчика на чекбоксы
    document.querySelectorAll('.actions-item input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const item = e.target.closest('.actions-item');
            item.classList.toggle('completed', cb.checked);
        });
    });

    // Фильтры
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.filter;
            alert(`Фильтрация задач: ${type}`);
        });
    });
});