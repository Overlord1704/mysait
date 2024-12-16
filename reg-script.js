// Обработчик для регистрации
const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        document.getElementById('message').textContent = data.message;

        // Если регистрация успешна, сохраняем имя пользователя
        if (response.ok) {
            localStorage.setItem('isAuthorized', 'true');
            localStorage.setItem('username', username); // Сохраняем имя пользователя
            window.location.href = 'index.html'; // Перенаправляем на главную страницу
        }
    });
}

// Обработчик для авторизации
const authForm = document.getElementById('authForm');
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        document.getElementById('message').textContent = data.message;

        if (response.ok) {
            // Успешная авторизация, сохраняем имя пользователя
            localStorage.setItem('isAuthorized', 'true');
            localStorage.setItem('username', username); // Сохраняем имя пользователя
            window.location.href = 'index.html'; // Перенаправляем на главную страницу
        }
    });
}
