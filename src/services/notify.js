import loggerFunction from './logger';
import {
  statusAnswer,
} from './helpers';
import socketIdValidation from './validations/notify';

const filePath = __filename;
const notifyIdArray = [];
let errorBody = '';

/**
 * addSocketId() - добовляет эксклюзивный socketId в массив
 * notifyIdArray
 * @param {string} socketId
 */
const addSocketId = async (socketId) => {
  const validatedData = await socketIdValidation(socketId);

  if (validatedData.catchError) {
    const negativeAnswer = await statusAnswer(true, '11', 'authorize fail. Wrong request', JSON.stringify(validatedData.catchError));
    loggerFunction('addSocketId', filePath, negativeAnswer, 'error');

    return negativeAnswer;
  }
  const isSocketInArray = notifyIdArray.includes(validatedData);

  if (!isSocketInArray) {
    notifyIdArray.push(socketId);

    const messageBody = JSON.stringify({
      addItemsArray: notifyIdArray,
    });

    const positiveAnswer = await statusAnswer(false, '00', 'OK', messageBody);
    loggerFunction('addSocketId', filePath, positiveAnswer, 'info');

    return positiveAnswer;
  }
  errorBody = JSON.stringify({
    error: 'Такой элемент уже существует',
  });
  const negativeAnswer = await statusAnswer(true, '01', 'addSocketId fail', errorBody);
  loggerFunction('addSocketId', filePath, negativeAnswer, 'error');

  return negativeAnswer;
};
/**
 * getSocketIdArray() - возвращает массив ID сокетов
 */
const getSocketIdArray = async () => {
  const positiveAnswer = await statusAnswer(false, '00', 'OK', JSON.stringify(notifyIdArray));
  loggerFunction('getSocketIdArray', filePath, positiveAnswer, 'info');

  return notifyIdArray;
};
/**
 * removeSockeIdFromArray() - удаляет socketId из массива, если произошел
 * дисконнект
 * @param {String} socketId
 */
const removeSockeIdFromArray = async (socketId) => {
  const validatedData = await socketIdValidation(socketId);

  if (validatedData.catchError) {
    const negativeAnswer = await statusAnswer(true, '11', 'authorize fail. Wrong request', JSON.stringify(validatedData.catchError));
    loggerFunction('addSocketId', filePath, negativeAnswer, 'error');

    return negativeAnswer;
  }

  const foundIndex = notifyIdArray.findIndex((element) => element === socketId);

  if (foundIndex !== -1) {
    const removingElement = notifyIdArray.splice(foundIndex, 1);
    const positiveAnswer = await statusAnswer(false, '00', 'OK', JSON.stringify(removingElement));
    loggerFunction('removeSockeIdFromArray', filePath, positiveAnswer, 'info');

    return positiveAnswer;
  }

  const negativeAnswer = await statusAnswer(true, '04', 'Такой элемент не найден', JSON.stringify({ elem: socketId }));
  loggerFunction('removeSockeIdFromArray', filePath, negativeAnswer, 'warn');

  return negativeAnswer;
};

export {
  addSocketId,
  getSocketIdArray,
  removeSockeIdFromArray,
};
