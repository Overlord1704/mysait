function initializeLocalStorage() {
    if (localStorage.getItem('isAuthorized') === null) {
        localStorage.setItem('isAuthorized', 'false'); // Устанавливаем false по умолчанию
    }
}

function updateInterface() {
    const isAuthorized = localStorage.getItem('isAuthorized') === 'true';
    const username = localStorage.getItem('username');

    const sendNewsButton = document.getElementById('send-news-button');
    const userInfo = document.getElementById('user-info');

    if (isAuthorized && (username === 'admin')) {
        sendNewsButton.style.display = 'block'; // Показываем кнопку "Отправить новость"
        userInfo.textContent = `Пользователь: ${username}`; // Обновляем текст с именем пользователя
    } else if (isAuthorized && username) {
        sendNewsButton.style.display = 'none'; // Скрываем кнопку "Отправить новость"
        userInfo.textContent = `Пользователь: ${username}`;
    }else 
	{
		sendNewsButton.style.display = 'none'; // Скрываем кнопку "Отправить новость"
        userInfo.textContent = 'Регистрация'; // Возвращаем текст "Регистрация"
	}
	
}

// Инициализация localStorage при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initializeLocalStorage(); // Инициализируем localStorage
    updateInterface(); // Обновляем интерфейс
});

// Обработка события подписки
document.getElementById('subscribe-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('subscribe-email').value;

    fetch('/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('subscribe-response').innerText = data.message;
    })
    .catch(error => {
        console.error('Ошибка:', error);
        document.getElementById('subscribe-response').innerText = 'Произошла ошибка при подписке.';
    });
});

