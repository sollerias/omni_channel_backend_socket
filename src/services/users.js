import loggerFunction from './logger';
import {
  statusAnswer,
} from './helpers';

const filePath = __filename;
const users = [];

/**
 * onlyUnique() возвращает только один из повторяющихся элементов
 * массива
 * @param {*} value
 * @param {*} index
 * @param {*} self
 */
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// addUser, removeUser, getUser, getUsersInRoom
// Начало: Блок функций авторизации и перехода по страницам
// TODO: удалить { error: null } везде, где есть это выражение
// authorize - авторизация, рефреш пользователя.
const authorize = async ({ userId, socketId, page }) => {
  const socketIds = [];
  let uniqueSocketIds = [];
  const journalName = 'authorize';
  const pageAfterLowerCase = page.trim().toLowerCase();
  console.log('initial users: ', users);
  console.log('users.js authorize data: ', userId, socketId, page);
  // page = page.trim().toLowerCase();
  const data1 = JSON.stringify({
    users, userId, socketId, pageAfterLowerCase,
  });
  loggerFunction('authorizeInfo', filePath, data1, 'info');
  // Исп-ся, если нет такого польз-ля в БД.
  if (typeof userId === 'undefined') {
    return { error: 'Ошибка входа' };
  }
  // isUserExist - исп-ся при переходе пользователя по страницам, socket.id сохраняется
  const isUserExist = users.find((user) => {
    // return user.userId === userId && user.page !== page && user.uniqueSocketIds[0] === socketId
    if (user.uniqueSocketIds !== null && user.uniqueSocketIds !== undefined) {
      return user.userId === userId && user.uniqueSocketIds[0] === socketId;
    }

    return false;
  });
  // onDisconnect - исп-ся в случае рефреша страницы пользователем или
  // неожиданного отключения сокетов
  const onDisconnect = users.find((user) => user.userId === userId
                                            && user.uniqueSocketIds === undefined);
  // isTabDuplicate - исп-ся в случае открытия второй вкладки
  const isTabDuplicate = users.find((user) => {
    if (user.uniqueSocketIds !== null && user.uniqueSocketIds !== undefined) {
      return user.userId === userId && user.uniqueSocketIds[0] !== socketId;
    }

    return false;
  });
  // socketNull - исп-ся после нажатия кнопки "Выйти из других окон".
  // В этот момент массив uniqueSocketIds имеет значение null
  const socketNull = users.find((user) => user.userId === userId && user.uniqueSocketIds === null);

  // Если польз-ль существует, просто дать ему работать. Выполняется
  // при переходе пользователя между страницами приложения без обновления
  // страницы
  if (isUserExist) {
    const foundIndex = users.findIndex((user) => user.userId === userId);
    console.log('isUserExist: ', users[foundIndex]);
    users[foundIndex].pageAfterLowerCase = pageAfterLowerCase;
    console.log('uniqueUsersArray: ', users);
    const data2 = JSON.stringify({ isUserExist: users });
    loggerFunction('isUserExistInfo', filePath, data2, 'info');
    // TODO: удалить { error: null } и сделать return users[foundIndex].page = page
    return { error: null };
  }
  // Исп-ся в случае рефреша страницы или иного случая
  // неожиданного закрытия сокетов
  if (onDisconnect) {
    console.log('onDisconnect: ', socketId);
    const foundIndex = users.findIndex((user) => user.userId === userId);
    // return users[foundIndex].socketId = socketId
    users[foundIndex].uniqueSocketIds = [];
    users[foundIndex].uniqueSocketIds.push(socketId);
    // Фильтрую массив, оставляя только уникальные элементы,
    // поскольку при нажатии клавиши "Войти" пользов-ль сразу
    // попадает на несколько страниц типа main и login с одинаковым
    // socket.id
    users[foundIndex].uniqueSocketIds = users[foundIndex].uniqueSocketIds.filter(onlyUnique);
    const data3 = JSON.stringify({ onDisconnect: users[foundIndex] });
    loggerFunction('isUserExistInfo', filePath, data3, 'info');
    console.log('onDisconnect user: ', users[foundIndex]);
    return { error: null };
  }
  // Исп-ся в случае дублирования вкладки браузера
  if (isTabDuplicate) {
    foundIndex = users.findIndex((user) => user.userId === userId);
    users[foundIndex].uniqueSocketIds.push(socketId);
    users[foundIndex].uniqueSocketIds = users[foundIndex].uniqueSocketIds.filter(onlyUnique);
    data4 = JSON.stringify({ duplicate: users });
    logging.writeLog(logDirectory, dirname, fileName, journalName, data4);
    console.log('duplicate user: ', users);
    return { error: 'duplicate' };
  }
  // Если пользователь находится на любой странице после
  // нажатия клавиши "Выйти из других окон"
  if (socketNull) {
    console.log('socketNull');
    foundIndex = users.findIndex((user) => user.userId === userId);
    data5 = JSON.stringify({ socketNull: foundIndex });
    logging.writeLog(logDirectory, dirname, fileName, journalName, data5);
    // users[foundIndex].uniqueSocketIds.push(socketId)
    return users[foundIndex].uniqueSocketIds = [socketId];
  }
  // Исп-ся в случае, если польз-ль зашел в приложение в первый раз

  socketIds.push(socketId);
  uniqueSocketIds = socketIds.filter(onlyUnique);
  console.info('uniqueSocketIds: ', uniqueSocketIds);
  const user = { userId, uniqueSocketIds, pageAfterLowerCase };
  users.push(user);
  console.log('uniqueUsersArray: ', users);
  data6 = JSON.stringify({ uniqueSocketIds, uniqueUsersArray: users });
  logging.writeLog(logDirectory, dirname, fileName, journalName, data6);
  return { user };
};
/**
 * logout() - отрабатывает при нажатии польз-ля на кнопку "Выход".
 * Удаляет польз-ля из массива users
 * @param {integer} userId
 */
const logout = (userId) => {
  const journalName = 'logout';
  console.log('02', userId);
  foundIndex = users.findIndex((user) => user.userId === userId);
  console.log('logout users.splice: ', users.splice(foundIndex, 1));
  console.log('users after remove: ', users);
  logData = JSON.stringify({ userId, 'logout users.splice': users.splice(foundIndex, 1), 'users after remove': users });
  logging.writeLog(logDirectory, dirname, fileName, journalName, logData);
  if (foundIndex !== -1) {
    return users.splice(foundIndex, 1);
  }
};
/**
 * logoutEverywhere() - отрабатывает при нажатии на кнопку "Выйти из других окон"
 * @param {integer} userId
 * @param {string} page
 */
const logoutEverywhere = ({ userId, page }) => {
  const journalName = 'logoutEverywhere';

  console.log('users.js logoutEverywhere userId: ', userId);
  foundIndex = users.findIndex((user) => user.userId === userId);
  logData1 = JSON.stringify({ userId });

  if (foundIndex !== -1) {
    users[foundIndex].page = page;
    users[foundIndex].uniqueSocketIds = null;
    console.log('logoutEverywhere user: ', users[foundIndex]);
    logData2 = JSON.stringify({ user: users[foundIndex] });
    logging.writeLog(logDirectory, dirname, fileName, journalName, logData = `${logData1} | ${logData2}`);
    return { error: null };
  }
  console.log('Increadible error logoutEverywhere');
};
/**
 * getLogoutUser() - необходимая ф-ия для того, чтобы
 * из массива пользов-лей взять необходимого и у него
 * извлечь массив сокетов
 * @param {integer} userId - ID польз-ля в БД (пр. 489)
 */
const getLogoutUser = (userId) => {
  foundIndex = users.findIndex((user) => user.userId === userId);
  console.log('getLogoutUser foundIndex: ', foundIndex);
  console.log('getLogoutUser: ', users[foundIndex]);
  if (foundIndex !== -1) {
    return users[foundIndex];
  }
};
/**
 * disconnect() - отрабатывает при системном дисконнекте
 * @param {*} socketId
 */
const disconnect = (socketId) => {
  const journalName = 'disconnect';
  console.log('disconnect socketId: ', socketId);
  // foundIndex = users.findIndex((user) => user.uniqueSocketIds[0] === socketId)
  foundIndex = users.findIndex((user) => x = (user.uniqueSocketIds !== undefined && user.uniqueSocketIds !== null) ? user.uniqueSocketIds[0] === socketId : false);
  console.log('disconnect foundIndex: ', foundIndex);
  logData1 = JSON.stringify({ socketId, foundIndex });

  if (foundIndex !== -1) {
    users[foundIndex].uniqueSocketIds = undefined;
    console.log('disconnect user: ', users[foundIndex]);
    logData2 = JSON.stringify({ user: users[foundIndex] });
    logging.writeLog(logDirectory, dirname, fileName, journalName, logData = `${logData1} | ${logData2}`);
    return { error: null };
  }
  console.log('disconnect: ', foundIndex);
};

module.exports = {
  authorize,
  logout,
  logoutEverywhere,
  getLogoutUser,
  disconnect,
};
