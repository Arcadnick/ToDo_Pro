document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addStickerBtn');
    const stickersGrid = document.getElementById('stickers');

    const stickerModalOverlay = document.getElementById('stickerModalOverlay');
    const stickerModal = document.getElementById('stickerModal');
    const stickerForm = document.getElementById('stickerForm');
    const modalTitle = document.getElementById('modalTitle');
    const cancelModalBtn = document.getElementById('cancelModal');

    const inputTitle = document.getElementById('stickerTitle');
    const inputContent = document.getElementById('stickerContent');
    const inputColor = document.getElementById('stickerColor');

    let stickers = JSON.parse(localStorage.getItem('stickers')) || [];
    let dragSourceId = null;
    let lastTargetId = null;
    let editingStickerId = null;

    updateTodayCount?.();

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
        if (index1 !== -1 && index2 !== -1 && index1 !== index2) {
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

        titleElem.addEventListener('dblclick', () => openEditModal(id));
        contentElem.addEventListener('dblclick', () => openEditModal(id));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => {
            stickers = stickers.filter(s => s.id !== id);
            saveStickers();
            renderAllStickers();
        });

        sticker.addEventListener('dragstart', () => {
            dragSourceId = id;
            lastTargetId = null;
            sticker.classList.add('dragging');
        });

        sticker.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (id !== dragSourceId) {
                lastTargetId = id;
            }
        });

        sticker.addEventListener('dragend', () => {
            sticker.classList.remove('dragging');
            if (lastTargetId && dragSourceId && lastTargetId !== dragSourceId) {
                swapStickers(dragSourceId, lastTargetId);
            }
            dragSourceId = null;
            lastTargetId = null;
        });

        sticker.appendChild(deleteBtn);
        sticker.appendChild(titleElem);
        sticker.appendChild(contentElem);

        stickersGrid.insertBefore(sticker, addBtn);
    }

    function renderAllStickers() {
        stickersGrid.querySelectorAll('.sticker:not(.add-sticker)').forEach(el => el.remove());
        stickers.forEach(data => createStickerElement(data));
    }

    function openStickerModal() {
        stickerModal.classList.add('show');
        stickerModalOverlay.classList.add('active');
    }

    function closeStickerModal() {
        stickerModal.classList.remove('show');
        stickerModalOverlay.classList.remove('active');
    }

    function openEditModal(id) {
        const sticker = stickers.find(s => s.id === id);
        if (!sticker) return;

        editingStickerId = id;
        modalTitle.textContent = 'Редактировать заметку';
        inputTitle.value = sticker.title;
        inputContent.value = sticker.content;
        inputColor.value = sticker.color;
        openStickerModal();
    }

    cancelModalBtn.addEventListener('click', () => {
        closeStickerModal();
        editingStickerId = null;
    });

    stickerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const updated = {
            title: inputTitle.value.trim(),
            content: inputContent.value.trim(),
            color: inputColor.value
        };

        if (!updated.title || !updated.content) return alert('Заполните все поля');

        if (editingStickerId) {
            updateSticker(editingStickerId, updated);
            editingStickerId = null;
        } else {
            const newSticker = {
                id: Date.now(),
                ...updated
            };
            stickers.push(newSticker);
            saveStickers();
        }

        closeStickerModal();
        stickerForm.reset();
        renderAllStickers();
    });

    addBtn.addEventListener('click', () => {
        editingStickerId = null;
        modalTitle.textContent = 'Новая заметка';
        stickerForm.reset();
        inputColor.value = 'yellow';
        openStickerModal();
    });

    // Закрытие по клику на overlay
    stickerModalOverlay.addEventListener('click', () => {
        closeStickerModal();
        editingStickerId = null;
    });

    renderAllStickers();
});



