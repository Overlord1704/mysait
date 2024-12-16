// Форма обратной связи
// Форма обратной связи
document.getElementById('feedback-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;

    // Показать сообщение о загрузке
    const feedbackResponse = document.getElementById('feedback-response');
    feedbackResponse.innerText = 'Отправка...';

    fetch('/feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, message: message })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Сетевая ошибка');
        }
        return response.json();
    })
    .then(data => {
        feedbackResponse.innerText = data.message; // Сообщение от сервера
    })
    .catch(error => {
        console.error('Ошибка:', error);
        feedbackResponse.innerText = 'Произошла ошибка :/.';
    });
});
