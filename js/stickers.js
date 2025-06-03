document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addStickerBtn');
    const stickersGrid = document.getElementById('stickers');

    let stickers = JSON.parse(localStorage.getItem('stickers')) || [];

    function saveStickers() {
        localStorage.setItem('stickers', JSON.stringify(stickers));
    }

    function updateSticker(id, updatedFields) {
        stickers = stickers.map(s => s.id === id ? { ...s, ...updatedFields } : s);
        saveStickers();
    }

    function swapStickers(id1, id2) {
        const index1 = stickers.findIndex(s => s.id === id1);
        const index2 = stickers.findIndex(s => s.id === id2);
        if (index1 !== -1 && index2 !== -1) {
            [stickers[index1], stickers[index2]] = [stickers[index2], stickers[index1]];
            saveStickers();
            renderAllStickers();
        }
    }

    function createStickerElement({ title, content, color, id }) {
        const sticker = document.createElement('div');
        sticker.classList.add('sticker', color);
        sticker.dataset.id = id;
        sticker.setAttribute('draggable', 'true');

        const titleElem = document.createElement('h3');
        titleElem.textContent = title;

        const contentElem = document.createElement('p');
        contentElem.textContent = content;

        titleElem.addEventListener('dblclick', () => {
            const newTitle = prompt('Редактировать заголовок:', titleElem.textContent);
            if (newTitle !== null) {
                titleElem.textContent = newTitle;
                updateSticker(id, { title: newTitle });
            }
        });

        contentElem.addEventListener('dblclick', () => {
            const newContent = prompt('Редактировать содержимое:', contentElem.textContent);
            if (newContent !== null) {
                contentElem.textContent = newContent;
                updateSticker(id, { content: newContent });
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => {
            stickers = stickers.filter(s => s.id !== id);
            saveStickers();
            renderAllStickers();
        });

        // drag events
        sticker.addEventListener('dragstart', () => {
            sticker.classList.add('dragging');
        });

        sticker.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragging = stickersGrid.querySelector('.dragging');
            if (dragging && dragging !== sticker) {
                const idFrom = parseInt(dragging.dataset.id);
                const idTo = parseInt(sticker.dataset.id);
                swapStickers(idFrom, idTo);
            }
        });

        sticker.addEventListener('dragend', () => {
            sticker.classList.remove('dragging');
        });

        sticker.appendChild(deleteBtn);
        sticker.appendChild(titleElem);
        sticker.appendChild(contentElem);

        return sticker;
    }

    function renderAllStickers() {
        // Удаляем все кроме кнопки добавления
        stickersGrid.querySelectorAll('.sticker:not(.add-sticker)').forEach(el => el.remove());
        stickers.forEach(data => {
            const el = createStickerElement(data);
            stickersGrid.insertBefore(el, addBtn);
        });
    }

    addBtn.addEventListener('click', () => {
        const title = prompt('Введите заголовок заметки:');
        const content = prompt('Введите текст заметки:');
        if (!title || !content) return;

        const colors = ['yellow', 'blue', 'pink', 'orange', 'gray'];
        const color = prompt('Выберите цвет: yellow, blue, pink, orange, gray', 'gray');
        if (!colors.includes(color)) return alert('Неверный цвет!');

        const newSticker = {
            id: Date.now(),
            title,
            content,
            color
        };

        stickers.push(newSticker);
        saveStickers();
        renderAllStickers();
    });

    // Инициализация
    renderAllStickers();
});

