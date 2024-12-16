const http = require('http'); // для http сервера
const fs = require('fs'); // для работы с файлами
const path = require('path'); // для путей к файлам
const nodemailer = require('nodemailer'); // для отправки по почте
const { Pool } = require('pg'); // для работы с PostgreSQL

const hostname = '127.0.0.1'; // адрес
const port = 3000; // порт сервера

// Настройка подключения к PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '1234',
    port: 5432,
});

// Настройка отправки почты
const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'testacc1935@mail.ru',
        pass: '5kRxTkxs1wg2niAw60Qq'
    },
    logger: true,
    debug: false
});

// Создание HTTP сервера
const server = http.createServer(async (req, res) => {
    const url = req.url;
	
	// Обработка запроса по регистрации
    if (url === '/api/auth/register' && req.method === 'POST') {
        console.log('Запрос на /api/auth/register получен');
        let dat = '';

        req.on('data', chunk => {
            dat += chunk.toString();
        });

        req.on('end', async () => {
            console.log('Данные получены:', dat);
            try {
                const data = JSON.parse(dat);
                const username = data.username;
                const password = data.password;

                // Проверка на уникальность имени пользователя
                const userExists = await pool.query('SELECT * FROM users WHERE username = \$1', [username]);
                if (userExists.rows.length > 0) {
                    console.log('Пользователь уже существует:', username);
                    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ message: 'Пользователь уже существует' }));
                    return;
                }

                // Сохранение нового пользователя
                await pool.query('INSERT INTO users (username, password) VALUES (\$1, \$2)', [username, password]);
                console.log('Пользователь зарегистрирован:', username);
                res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ message: 'Пользователь зарегистрирован' }));
            } catch (error) {
                console.error('Ошибка при обработке JSON:', error);
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ message: 'С json файлом проблема.' }));
            }
        });
    }
    // Обработка авторизации
    else if (url === '/api/auth/login' && req.method === 'POST') {
		console.log('Запрос на /api/auth/login получен');
		let dat = '';

		req.on('data', chunk => {
			dat += chunk.toString();
		});

		req.on('end', async () => {
			console.log('Данные получены:', dat);
			try {
				const data = JSON.parse(dat);
				const username = data.username;
				const password = data.password;

				// Поиск пользователя в базе данных
				const userResult = await pool.query('SELECT * FROM users WHERE username = \$1 AND password = \$2', [username, password]);
				const user = userResult.rows[0];

				// Проверка, существует ли пользователь и корректен ли пароль
				if (!user) {
					console.log('Неверные учетные данные:', username);
					res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
					res.end(JSON.stringify({ message: 'Неверное имя пользователя или пароль' }));
					return;
				}

				// Если вы хотите проверить пароль в открытом виде (что не рекомендуется)
				if (password !== user.password) {
					console.log('Неверные учетные данные:', username);
					res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
					res.end(JSON.stringify({ message: 'Неверное имя пользователя или пароль' }));
					return;
				}

				
				console.log('Пользователь авторизован:', username);
				res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
				res.end(JSON.stringify({ message: 'Авторизация успешна', username: username }));
				} catch (error) {
					console.error('Ошибка при обработке JSON:', error);
					res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
					res.end(JSON.stringify({ message: 'С json файлом проблема.' }));
				}
		});
	}

    // Обработка отправки новости
    else if (url === '/submit-news' && req.method === 'POST') {
        console.log('Запрос на /submit-news получен');
        let dat = '';

        req.on('data', chunk => {
            dat += chunk.toString();
        });

        req.on('end', async () => {
            console.log('Данные получены:', dat);
            try {
                const data = JSON.parse(dat);
                const title = data.title;
                const content = data.content;

                // Получение адресов подписчиков из базы данных
                const subscriberResult = await pool.query('SELECT email FROM subscribers');
                const subscribers = subscriberResult.rows.map(row => row.email);

                // Настройка письма
                const mailOptions = {
                    from: 'testacc1935@mail.ru',
                    to: subscribers,
                    subject: title,
                    text: content
                };

                // Отправка письма
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Ошибка при отправке письма:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ message: 'Ошибка при отправке письма.' }));
                    } else {
                        console.log('Письмо отправлено:', info.response);
                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ message: 'Письмо отправлено успешно!' }));
                    }
                });

            } catch (error) {
                console.log('Ошибка при обработке JSON:', error);
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ message: 'С json файлом проблема.' }));
            }
        });
    }
    // Обработка обратной связи
    else if (url === '/feedback' && req.method === 'POST') {
        console.log('Запрос /feedback получен');
        let dat = '';

        req.on('data', chunk => {
            dat += chunk.toString();
        });

        req.on('end', async () => {
            console.log('Данные получены:', dat);
            try {
                const data = JSON.parse(dat);
                const name = data.name;
                const message = data.message;

                const mailOptions = {
                    from: 'testacc1935@mail.ru',
                    to: 'testacc1935@mail.ru',
                    subject: `Обратная связь. Сообщение от ${name}`,
                    text: message
                };

                // Отправка письма
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Ошибка при отправке письма:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ message: 'Ошибка при отправке письма ' }));
                    } else {
                        console.log('Письмо отправлено:', info.response);
                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ message: 'Письмо отправлено успешно!' }));
                    }
                });
            } catch (error) {
                console.log('Ошибка при обработке JSON:', error);
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ message: 'Проблема в json.' }));
            }
        });
    }
    // Обработка подписки на новости
    else if (url === '/subscribe' && req.method === 'POST') {
    let dat = '';
    req.on('data', chunk => {
        dat += chunk.toString();
    });
    req.on('end', async () => {
        const data = JSON.parse(dat);
        const email = data.email;

        try {
            // Проверка на существование адреса электронной почты
            const existingSubscriber = await pool.query('SELECT * FROM subscribers WHERE email = \$1', [email]);
            if (existingSubscriber.rows.length > 0) {
                console.log(`Подписчик уже существует: ${email}`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Этот адрес электронной почты уже подписан на новости.' }));
                return;
            }

            // Сохранение адреса подписчика в базе данных
            await pool.query('INSERT INTO subscribers (email) VALUES (\$1)', [email]);
            console.log(`Подписался: ${email}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Вы успешно подписались на новости!' }));
        } catch (error) {
            console.error('Ошибка при обработке подписки:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Ошибка при обработке подписки.' }));
        }
    });
} else {
    // Обработка остальных запросов
    let filePath = '.' + url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-sfnt',
        '.css.map': 'text/css',
        '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Извините, произошла ошибка: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

});

// Запуск сервера
server.listen(port, hostname, () => {
    console.log(`Сервер запущен - http://${hostname}:${port}/`);
});
