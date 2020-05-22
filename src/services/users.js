import loggerFunction from './logger';
import {
  statusAnswer,
} from './helpers';
import {
  authorizeValidation,
  logoutValidation,
  logoutEveryWhereValidation,
  getLogoutUserValidation,
  disconnectValidation,
} from './validations/users';

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
  const validatedData = await authorizeValidation({ userId, socketId, page });

  if (validatedData.catchError) {
    const logoutAnswer = await statusAnswer(true, '11', 'authorize fail. Wrong request', JSON.stringify(validatedData.catchError));
    loggerFunction('logoutError', filePath, logoutAnswer, 'error');

    return logoutAnswer;
  }

  const socketIds = [];
  let uniqueSocketIds = [];
  const pageAfterLowerCase = page.trim().toLowerCase();
  // console.log('initial users: ', users);
  // console.log('users.js authorize data: ', userId, socketId, page);
  const data1 = JSON.stringify({
    users, userId, socketId, page: pageAfterLowerCase,
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
  console.log('!!!', isUserExist);
  if (isUserExist) {
    const foundIndex = users.findIndex((user) => user.userId === userId);
    // console.log('isUserExist: ', users[foundIndex]);
    users[foundIndex].page = pageAfterLowerCase;
    // console.log('uniqueUsersArray: ', users);
    const data2 = JSON.stringify({ isUserExist: users });
    loggerFunction('isUserExistInfo', filePath, data2, 'info');
    // TODO: удалить { error: null } и сделать return users[foundIndex].page = page
    const positiveAnswer = await statusAnswer(false, '00', 'User exist');
    loggerFunction('authorize', filePath, positiveAnswer, 'info');

    // return { error: null };
    return positiveAnswer;
  }
  // Исп-ся в случае рефреша страницы или иного случая
  // неожиданного закрытия сокетов
  if (onDisconnect) {
    // console.log('onDisconnect: ', socketId);
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
    // console.log('onDisconnect user: ', users[foundIndex]);
    return { error: null };
  }
  // Исп-ся в случае дублирования вкладки браузера
  if (isTabDuplicate) {
    const foundIndex = users.findIndex((user) => user.userId === userId);
    users[foundIndex].uniqueSocketIds.push(socketId);
    users[foundIndex].uniqueSocketIds = users[foundIndex].uniqueSocketIds.filter(onlyUnique);
    const data4 = JSON.stringify({ duplicate: users });
    loggerFunction('isTabDuplicateInfo', filePath, data4, 'info');
    // console.log('duplicate user: ', users);
    return { error: 'duplicate' };
  }
  // Если пользователь находится на любой странице после
  // нажатия клавиши "Выйти из других окон"
  if (socketNull) {
    // console.log('socketNull');
    const foundIndex = users.findIndex((user) => user.userId === userId);
    const data5 = JSON.stringify({ socketNull: foundIndex });
    loggerFunction('socketNullInfo', filePath, data5, 'info');
    users[foundIndex].uniqueSocketIds = [socketId];

    return true;
  }
  // Исп-ся в случае, если польз-ль зашел в приложение в первый раз

  socketIds.push(socketId);
  uniqueSocketIds = socketIds.filter(onlyUnique);
  const user = { userId, uniqueSocketIds, page };
  users.push(user);
  // console.info('uniqueSocketIds: ', uniqueSocketIds);
  // console.log('uniqueUsersArray: ', users);

  const data6 = JSON.stringify({ uniqueSocketIds, uniqueUsersArray: users });
  loggerFunction('authorizeUserInfo', filePath, data6, 'info');

  return { user };
};
/**
 * logout() - отрабатывает при нажатии польз-ля на кнопку "Выход".
 * Удаляет польз-ля из массива users
 * @param {integer} userId
 */
const logout = async (userId) => {
  const validatedData = await logoutValidation(userId);

  if (validatedData.catchError) {
    const logoutAnswer = await statusAnswer(true, '11', 'Logout fail. Wrong request');
    loggerFunction('logoutError', filePath, logoutAnswer, 'error');

    return logoutAnswer;
  }

  const foundIndex = users.findIndex((user) => user.userId === validatedData);
  const logData = JSON.stringify({ userId, 'logout users.splice': users.splice(foundIndex, 1), 'users after remove': users });
  loggerFunction('logoutInfo', filePath, logData, 'info');

  if (foundIndex !== -1) {
    users.splice(foundIndex, 1);
    const positiveAnswer = await statusAnswer(false, '00', 'Logout success', JSON.stringify(users.splice(foundIndex, 1)));
    loggerFunction('logoutSuccess', filePath, positiveAnswer, 'info');

    return positiveAnswer;
  }

  const logoutAnswer = await statusAnswer(true, '01', 'Logout fail');
  loggerFunction('logoutError', filePath, logoutAnswer, 'error');

  return logoutAnswer;
};
/**
 * logoutEverywhere() - отрабатывает при нажатии на кнопку "Выйти из других окон"
 * @param {integer} userId
 * @param {string} page
 */
const logoutEverywhere = async (logoutObject) => {
  const validatedData = await logoutEveryWhereValidation(logoutObject);
  const { userId, page } = validatedData;
  if (validatedData.catchError) {
    const logoutAnswer = await statusAnswer(true, '11', 'Logout fail. Wrong request', JSON.stringify(validatedData.catchError));
    loggerFunction('logoutEverywhere', filePath, logoutAnswer, 'error');

    return logoutAnswer;
  }

  const foundIndex = users.findIndex((user) => user.userId === userId);

  if (foundIndex !== -1) {
    users[foundIndex].page = page;
    users[foundIndex].uniqueSocketIds = null;
    const positiveAnswer = await statusAnswer(false, '00', 'OK', users[foundIndex]);
    loggerFunction('logoutEverywhere', filePath, positiveAnswer, 'info');

    return positiveAnswer;
  }
  const negativeAnswer = await statusAnswer(true, '01', 'LogoutEverywhere fail', JSON.stringify({ userId, page }));
  loggerFunction('logoutEverywhere', filePath, negativeAnswer, 'error');

  return negativeAnswer;
};
/**
 * getLogoutUser() - необходимая ф-ия для того, чтобы
 * из массива пользов-лей взять необходимого и у него
 * извлечь массив сокетов
 * @param {integer} userId - ID польз-ля в БД (пр. 489)
 */
const getLogoutUser = async (userId) => {
  const validatedData = await getLogoutUserValidation(userId);

  if (validatedData.catchError) {
    const negativeAnswer = await statusAnswer(true, '11', 'getLogoutUser fail.', JSON.stringify(validatedData.catchError));
    loggerFunction('getLogoutUser', filePath, negativeAnswer, 'error');

    return negativeAnswer;
  }

  const foundIndex = users.findIndex((user) => user.userId === validatedData);

  if (foundIndex !== -1) {
    const positiveAnswer = await statusAnswer(false, '00', 'OK', users[foundIndex]);
    loggerFunction('getLogoutUser', filePath, positiveAnswer, 'info');

    return users[foundIndex];
  }

  const negativeAnswer = await statusAnswer(true, '13', 'getLogoutUser fail.', JSON.stringify({ userId: validatedData }));
  loggerFunction('getLogoutUser', filePath, negativeAnswer, 'error');

  return negativeAnswer;
};
/**
 * disconnect() - отрабатывает при системном дисконнекте
 * @param {*} socketId
 */
const disconnect = async (socketId) => {
  const validatedData = await disconnectValidation(socketId);

  if (validatedData.catchError) {
    const negativeAnswer = await statusAnswer(true, '11', 'disconnect fail.', JSON.stringify(validatedData.catchError));
    loggerFunction('disconnect', filePath, negativeAnswer, 'error');

    return negativeAnswer;
  }

  const foundIndex = users.findIndex((user) => {
    if (user.uniqueSocketIds !== undefined && user.uniqueSocketIds !== null) {
      // eslint-disable-next-line no-unused-expressions
      return user.uniqueSocketIds[0] === validatedData;
    }

    return false;
  });
  console.log('disconnect found index', foundIndex);


  if (foundIndex !== -1) {
    users[foundIndex].uniqueSocketIds = undefined;

    const positiveAnswer = await statusAnswer(false, '00', 'OK', JSON.stringify({ user: users[foundIndex] }));
    loggerFunction('disconnect', filePath, positiveAnswer, 'info');

    return positiveAnswer;
  }

  const negativeAnswer = await statusAnswer(true, '13', 'disconnect fail.');
  loggerFunction('disconnect', filePath, negativeAnswer, 'error');

  return negativeAnswer;
};

// module.exports = {
export {
  authorize,
  logout,
  logoutEverywhere,
  getLogoutUser,
  disconnect,
};
