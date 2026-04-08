/* theme.js - Dark/Light mode toggle */

function loadSavedTheme() {
    const saved = localStorage.getItem('footy-theme');
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
        DOM.themeToggle.textContent = '☀️';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    DOM.themeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('footy-theme', isDark ? 'dark' : 'light');
}
