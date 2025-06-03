document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addStickerBtn');
    const stickersGrid = document.getElementById('stickers');

    addBtn.addEventListener('click', () => {
        const title = prompt('Введите заголовок заметки:');
        const content = prompt('Введите текст заметки:');

        if (!title || !content) return;

        const newSticker = document.createElement('div');
        newSticker.classList.add('sticker', 'gray');
        newSticker.innerHTML = `
      <h3>${title}</h3>
      <p>${content}</p>
    `;

        // Вставим перед кнопкой "+"
        stickersGrid.insertBefore(newSticker, addBtn);
    });
});