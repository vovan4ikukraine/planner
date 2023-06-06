const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

app.use(express.static('src'));

// Подключение к базе данных MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'developer',
  database: 'planner'
});

connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных: ', err);
  } else {
    console.log('Подключено к базе данных MySQL');
  }
});

// Разрешить использование bodyParser для чтения данных из тела запроса
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Обработка GET-запроса на отображение страницы регистрации
app.get('/registration', (req, res) => {
  res.sendFile(__dirname + '/registration.html');
});

// Обработка POST-запроса на регистрацию администратора
app.post('/register', (req, res) => {
  const {first_name, middle_name, last_name, username, password} = req.body;
  // Хеширование пароля
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Ошибка при хешировании пароля: ', err);
      res.status(500).send('Произошла ошибка');
    } else {
      // Выполнить операцию вставки в таблицу administrators
      const sql = 'INSERT INTO administrators (first_name, middle_name, last_name, username, password) VALUES (?, ?, ?, ?, ?)';
      connection.query(sql, [first_name, middle_name, last_name, username, hashedPassword], (err, result) => {
        if (err) {
          console.error('Ошибка при выполнении операции вставки: ', err);
          res.status(500).send('Возникла ошибка при регистрации администратора');
        } else {
          console.log('Администратор успешно зарегистрирован');
          res.status(200).send('Администратор успешно зарегистрирован');
        }
      });
    }
  });
});

// Установка сеанса аутентификации
app.use(session({
  secret: 'secret_key',
  resave: true,
  saveUninitialized: true
}));

// Обработка GET-запроса на отображение страницы авторизации
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Обработка POST-запроса на авторизацию администратора
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Поиск администратора в базе данных по имени пользователя
  const sql = 'SELECT * FROM administrators WHERE username = ?';
  connection.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Ошибка при выполнении запроса: ', err);
      res.status(500).send('Произошла ошибка');
    } else if (results.length === 0) {
      res.status(401).send('Неверные учетные данные');
    } else {
      // Проверка пароля
      const administrator = results[0];
      bcrypt.compare(password, administrator.password, (err, isMatch) => {
        if (err) {
          console.error('Ошибка при сравнении паролей: ', err);
          res.status(500).send('Произошла ошибка');
        } else if (isMatch) {
          // Авторизация успешна
          req.session.admin = administrator;

// Генерация токена доступа (например, с использованием библиотеки uuid)
const accessToken = uuidv4();

// Сохранение токена доступа в базе данных
const updateAccessTokenQuery = 'UPDATE administrators SET accessToken = ? WHERE id = ?';
connection.query(updateAccessTokenQuery, [accessToken, administrator.id], (err, result) => {
  if (err) {
    console.error('Ошибка при обновлении токена доступа: ', err);
    res.status(500).send('Произошла ошибка');
  } else {
    // Токен доступа успешно сохранен

    // Установка cookie с именем "accessToken"
    res.cookie('accessToken', accessToken, { httpOnly: true });

    res.redirect('/dashboard'); // Перенаправление на защищенную страницу
  }
});
  
        } else {
          res.status(401).send('Неверные учетные данные');
        }
      });
    }
  });
});

// Защищенная страница (пример)
app.get('/dashboard', (req, res) => {
  // Проверка аутентификации администратора
  if (req.session.admin) {
    // Администратор авторизован
    const admin = req.session.admin;
    res.sendFile(__dirname + '/index.html', { admin: admin });
  } else {
    // Администратор не авторизован
    res.redirect('/login');
  }
});

// Защищенный маршрут для получения данных пользователя
app.get('/administrator', (req, res) => {
  // Проверка наличия авторизации и получение accessToken из кук
  const accessToken = req.cookies.accessToken;

  // Запрос в базу данных для поиска пользователя по accessToken
  const sql = 'SELECT * FROM administrators WHERE accessToken = ?';
  connection.query(sql, [accessToken], (err, results) => {
    if (err) {
      console.error('Ошибка при выполнении запроса: ', err);
      res.status(500).json({ success: false });
    } else if (results.length === 0) {
      // Пользователь не найден
      res.status(404).json({ success: false });
    } else {
      // Пользователь найден, вернуть его данные
      const administrator = results[0];
      const administratorData = {
        name: administrator.first_name,
        surname: administrator.last_name,
        middleName: administrator.middle_name
      };
      res.json({ success: true, administratorData });
    }
  });
});

// Обработка GET-запроса на выход из учетной записи
app.get('/logout', (req, res) => {
  // Удаление данных аутентификации из сеанса и cookie
  req.session.destroy();
  res.clearCookie('accessToken');
  res.redirect('/login');
});

// Маршрут для добавления оборудования
app.post('/add-equipment', (req, res) => {
  const equipmentName = req.body.equipmentName;
  const quantity = req.body.quantity || 0;

  // Выполнение запроса к базе данных для добавления оборудования
  const sql = 'INSERT INTO Equipment (Equipment_Name, Quantity) VALUES (?, ?)';
  connection.query(sql, [equipmentName, quantity], (error, results) => {
    if (error) {
      console.error('Ошибка при добавлении оборудования:', error);
      res.json({ success: false });
    } else {
      console.log('Оборудование успешно добавлено');

        // Выполнение запроса к базе данных для получения общего количества предметов
        const countSql = 'SELECT COUNT(*) AS totalCount FROM Equipment';
        connection.query(countSql, (countError, countResults) => {
          if (countError) {
            console.error('Ошибка при получении общего количества предметов:', countError);
            res.json({ success: false });
          } else {
            const totalCount = countResults[0].totalCount;
            res.json({ success: true, totalCount });
          }
        });
    }
  });
});

// Маршрут для получения списка предметов
app.get('/equipment', (req, res) => {
  const sql = 'SELECT * FROM Equipment';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Ошибка при выполнении запроса: ', err);
      res.status(500).json({ success: false });
    } else {
      res.json({ success: true, equipment: results });
    }
  });
});

// Маршрут для удаления оборудования
app.post('/delete-equipment', (req, res) => {
  const equipmentId = req.body.equipmentId;

  // Выполнение запроса к базе данных для удаления оборудования
  const sql = 'DELETE FROM Equipment WHERE Equipment_ID = ?';
  connection.query(sql, [equipmentId], (error, results) => {
    if (error) {
      console.error('Ошибка при удалении оборудования:', error);
      res.json({ success: false });
    } else {
      console.log('Оборудование успешно удалено');
      res.json({ success: true });
    }
  });
});

app.post('/edit-equipment', (req, res) => {
  const equipmentId = req.body.equipmentId;
  const equipmentName = req.body.equipmentName;
  const quantity = req.body.quantity;

  // Выполнение запроса к базе данных для сохранения отредактированного оборудования
  const sql = 'UPDATE Equipment SET Equipment_Name = ?, Quantity = ? WHERE Equipment_ID = ?';
  connection.query(sql, [equipmentName, quantity, equipmentId], (error, results) => {
    if (error) {
      console.error('Ошибка при сохранении отредактированного оборудования:', error);
      res.json({ success: false });
    } else {
      console.log('Оборудование успешно отредактировано');
      res.json({ success: true });
    }
  });
});

app.post('/increase-quantity', (req, res) => {
  const equipmentId = req.body.equipmentId;
  const quantityIncrease = req.body.quantityIncrease;

  // Выполнение запроса к базе данных для увеличения количества предметов
  const sql = 'UPDATE Equipment SET Quantity = Quantity + ? WHERE Equipment_ID = ?';
  connection.query(sql, [quantityIncrease, equipmentId], (error, results) => {
    if (error) {
      console.error('Ошибка при увеличении количества предметов:', error);
      res.json({ success: false });
    } else {
      console.log('Количество предметов успешно увеличено');
      res.json({ success: true });
    }
  });
});

app.post('/decrease-quantity', (req, res) => {
  const equipmentId = req.body.equipmentId;
  const quantityDecrease = req.body.quantityDecrease;

  // Выполнение запроса к базе данных для увеличения количества предметов
  const sql = 'UPDATE Equipment SET Quantity = Quantity - ? WHERE Equipment_ID = ?';
  connection.query(sql, [quantityDecrease, equipmentId], (error, results) => {
    if (error) {
      console.error('Ошибка при увеличении количества предметов:', error);
      res.json({ success: false });
    } else {
      console.log('Количество предметов успешно увеличено');
      res.json({ success: true });
    }
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});