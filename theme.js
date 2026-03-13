/**
 * theme.js - Модуль для переключения между светлой и темной темой
 * Сохраняет предпочтения пользователя в localStorage
 */

// Функция для установки темы
function setTheme(theme) {
    // Удаляем предыдущие классы темы
    document.body.classList.remove('light-theme', 'dark-theme');
    // Добавляем новый класс темы
    document.body.classList.add(theme + '-theme');
    
    // Обновляем текст и иконку кнопки
    const themeIcon = document.querySelector('.theme-icon');
    const themeText = document.querySelector('.theme-text');
    const themeBtn = document.getElementById('themeSwitcher');
    
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Светлая тема';
        themeBtn.setAttribute('aria-label', 'Переключить на светлую тему');
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Темная тема';
        themeBtn.setAttribute('aria-label', 'Переключить на темную тему');
    }
    
    // Сохраняем предпочтение в localStorage
    localStorage.setItem('preferred-theme', theme);
}

// Функция для переключения темы
function toggleTheme() {
    if (document.body.classList.contains('light-theme')) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

// Инициализация темы при загрузке страницы
function initTheme() {
    // Проверяем сохраненную тему в localStorage
    const savedTheme = localStorage.getItem('preferred-theme');
    
    // Проверяем системные предпочтения
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        // Используем сохраненную тему
        setTheme(savedTheme);
    } else if (prefersDark) {
        // Если нет сохраненной, но система предпочитает темную
        setTheme('dark');
    } else {
        // По умолчанию светлая
        setTheme('light');
    }
}

// Добавляем обработчик события после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем тему
    initTheme();
    
    // Добавляем обработчик на кнопку переключения темы
    const themeSwitcher = document.getElementById('themeSwitcher');
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', toggleTheme);
    }
    
    // Следим за изменением системных предпочтений
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Меняем тему только если пользователь явно не выбрал свою
        if (!localStorage.getItem('preferred-theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
});