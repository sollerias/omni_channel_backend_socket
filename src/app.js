import loggerFunction from './services/logger';
import {
  statusAnswer,
  // parseError,
  // encodeData,
} from './services/helpers';
import {
  authorize,
  logout,
  logoutEverywhere,
  getLogoutUser,
  disconnect,
} from './services/users';
// Ф-ии для работы с чатом
import {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  generateMessage,
} from './services/chat';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const socketio = require('socket.io');
const http = require('http');
const chalk = require('chalk');

require('dotenv').config({ path: './src/config/dev.env' });
// Ф-ии для работы с уведомлениями
const { addSocketId, getSocketIdArray, removeSockeIdFromArray } = require('./services/notify');

const filePath = __filename;

// const login = require('./apis/login.js');
const app = express();
// Без этого условия не будут считываться данные, приходящие
// от сервера backend через библиотеку request-promise-native
app.use(express.json({ extended: true }));
// app.use(express.json({ extended: false }));

app.use(helmet());
app.use(hpp());
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:4000',
  ],
  credentials: true,
}));

const server = http.createServer(app);
// Необходимо для корректной работы сокетов в браузере Chrome после 63 версии
// В противном случае постоянно выдает ошибку WebSocket is already in CLOSING or CLOSED state.
const io = socketio(server, {
  pingTimeout: 60000,
});

io.on('connection', (socket) => {
  // console.log('socket on connect: ', socket.id)
  socket.on('kek', async (data) => {
    const socketInfo = await statusAnswer(false, '00', 'All is good');
    loggerFunction('kekInfo', filePath, JSON.stringify(data), 'info');

    return socketInfo;
  });

  /**
   * authorize - авторизация пользователя и проверка его на каждой странице
   * приложения
   */
  socket.on('authorize', async (options, callback) => {
    const data1 = JSON.stringify({ options, socketId: socket.id });
    const {
      error,
      status,
      text,
      user,
    } = authorize({
      userId: options.userId,
      socketId: socket.id,
      page: options.page,
    });
    // console.log('1 ', user);
    // console.log('3 ', error);
    const data2 = JSON.stringify({ afterAuthorize: { user, error } });
    if (error) {
      if (text === 'Duplicate tab') {
        socket.emit('kick', { text: 'Вы уже работаете в другом окне' });
        const logInfo = await statusAnswer(true, '01', 'Вы уже работаете в другом окне');
        loggerFunction('authorizeError0', filePath, logInfo, 'warn');
        return;
      }

      const data4 = JSON.stringify({ generalError: error });
      loggerFunction('authorizeError2', filePath, data4, 'warn');
      callback(error);

      return;
    }
    // callback(true);
    // if (error === 'duplicate') {
    //   socket.emit('kick', { text: 'Вы уже работаете в другом окне' });
    //   const logInfo = await statusAnswer(true, '01', 'Вы уже работаете в другом окне');
    //   loggerFunction('authorizeError0', filePath, logInfo, 'warn');
    // }
    // const data = `${data1} | ${data2}`;
    // loggerFunction('authorizeError1', filePath, data, 'warn');

    // if (error) {
    //   const data4 = JSON.stringify({ generalError: error });
    //   loggerFunction('authorizeError2', filePath, data4, 'warn');
    //   return callback(error);
    // }
    return user;
  });

  /**
   * disconnectUser - emit на клиенте в store.js -> actions -> logout()
   * Делает логаут из системы при нажатии на кнопку Выход в Сириусе, в
   * панели инструментов
   */
  socket.on('disconnectUser', (data) => {
    console.log(chalk.red.inverse('logout: '));
    console.log(data);
    console.log(chalk.red.inverse('logout'));

    const data1 = JSON.stringify({ disconnectUser: data });
    // logging.writeLog(logDirectory, dirname, fileName, journalName, data1)

    logout(data.userId); // Удаляет польз-ля из массива users
    // Начало: Для чата
    const user = removeUser(data.userId); // Удаляет польз-ля из массива chatUsers

    const data2 = JSON.stringify({ removedUser: user });
    const data3 = `${data1} | ${data2}`;

    if (user) {
      // Отправляет сообщение о выходе польз-ля из чата
      io.to(user.room).emit('message', generateMessage('admin', `${user.username} вышел из чата!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
    loggerFunction('disconnectUser', filePath, data3, 'info');

    // Конец: Для чата
    socket.conn.close();
  });

  // /**
  //  * logoutEverywhere() - emit на клиенте в Login.vue при нажатии
  //  * на кнопку "Выйти из других окон"
  //  */
  socket.on('logoutEverywhere', (data, callback) => {
    // console.log('logoutEverywhere userId: ', data.userId);
    // console.log('logoutEverywhere socketId: ', socket.id);
    const data1 = JSON.stringify({ logoutEverywhereData: data });
    const user = getLogoutUser(data.userId); // Берем объект с данными конкретного польз-ля
    try {
      if (typeof user !== 'undefined' && user !== null && user.uniqueSocketIds !== null) {
        io.to(`${user.uniqueSocketIds[0]}`).emit('toLogin');
      } else {
        // Необходимо для решения вопроса в случае, если отрубили сервак и
        // пользователь остался на странице входа с включенной кнопкой
        // "Выйти из других окон". Если нажимает кнопку, то по сокету
        // пользователя перенаправляет на страницу логина
        io.to(socket.id).emit('toLogin');
        const logData4 = JSON.stringify({ text: 'error with uniqueSocketIds', uniqueSocketIdsType: typeof uniqueSocketIds });
        loggerFunction('logoutEverywhere', filePath, logData4, 'info');
        throw new Error('logoutEverywhere crash');
      }
    } catch (error) {
      const logData = JSON.stringify({ error });
      loggerFunction('logoutEverywhere', filePath, logData, 'error');
    }

    const data2 = JSON.stringify({ logoutUser: user });
    const data3 = `${data1} | ${data2}`;
    loggerFunction('logoutEverywhere', filePath, data3, 'info');
    logoutEverywhere({ userId: data.userId, page: data.page });

    callback(true);
  });
  /**
   * disconnect - действия, выполняющиеся при рефреше страницы или другом
   * неожиданном вылете сокетов
   */
  socket.on('disconnect', (reason) => {
    console.log(chalk.yellow.inverse('disconnect'));
    console.log(chalk.yellow.inverse('disconnect socket.id: ', socket.id));
    // socketClient.emit('tabloIt', 'gomos')
    removeSockeIdFromArray(socket.id);
    disconnect(socket.id);
  });

  // Test
  // socket.on('disconnect', () => {
  //   log('you have been disconnected');
  // });

  // socket.on('reconnect', () => {
  //   log('you have been reconnected');
  //   if (username) {
  //     socket.emit('add user', username);
  //   }
  // });

  // socket.on('reconnect_error', () => {
  //   log('attempt to reconnect has failed');
  // });
  // Test

  // Функции чата
  // join - отрабатывает при открытии пользователем вкладки Чат,
  // помещает пользователя в комнату default
  socket.on('join', (options, callback) => {
    // console.log('join options: ', options);
    const { error, user } = addUser({ ...options });
    // console.log(error)
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('admin', 'Добро пожаловать!'));
    socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} присоединился к чату!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    return callback();
  });

  socket.on('sendMessage', ({ message, userId }, callback) => {
    // console.log('sendMessage message: ', message, userId);
    const user = getUser(userId);
    // console.log('sendMessage user: ', user);
    io.to(user.room).emit('message', generateMessage(user.username, message));

    return callback();
  });

  // Get socketId of omnichannel platform
  socket.on('omnichannelConnect', () => {
    addSocketId(socket.id);
    console.log('omnichannelSocketId: ', socket.id);
  });

  // Начало: интерфейс для отправки уведомлений любого вида
  app.post('/notify', async (req, res) => {
    console.log('notify body data: ', req.body);
    // Валидация приходящих данных
    if (req.body) {
      // eslint-disable-next-line no-shadow
      getSocketIdArray().forEach((socket) => {
        io.to(socket).emit('omnichannelNotify', req.body);
      });
      const socketInfo = await statusAnswer(false, '00', 'All is good', req.body);
      loggerFunction('kekInfo', filePath, socketInfo, 'info');

      return res.json(socketInfo);
    }
    const errorBody = await statusAnswer(true, '11', 'Query problem', req.body);
    loggerFunction('kekInfo', filePath, errorBody, 'error');

    return res.json(errorBody);
  });
  // Конец: интерфейс для отправки уведомлений любого вида
});

module.exports = server;
