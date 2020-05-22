import loggerFunction from './logger';
import {
  statusAnswer,
} from './helpers';

const filePath = __filename;

const notifyIdArray = [];
let errorBody = '';
/**
 * addSocketId() - добовляет эксклюзивный socketId в массив
 * notifyIdArray
 * @param {string} socketId
 */
const addSocketId = async (socketId) => {
  const checkExistence = notifyIdArray.includes(socketId);
  if (!checkExistence) {
    const addElementToArray = notifyIdArray.push(socketId);
    const messageBody = JSON.stringify({
      addItemsArray: notifyIdArray,
    });
    console.log('addSocketId: ', notifyIdArray);
    loggerFunction('addSocketId', filePath, await statusAnswer(false, '00', 'addSocketIdInfo', messageBody), 'info');

    return addElementToArray;
  }
  errorBody = JSON.stringify({
    error: 'Такой элемент уже существует',
  });
  console.log(errorBody);
  loggerFunction('addSocketId', filePath, await statusAnswer(true, '04', 'addSocketIdInfo', errorBody), 'warn');

  return errorBody;
};
/**
 * getSocketIdArray() - возвращает массив ID сокетов
 */
const getSocketIdArray = () => notifyIdArray;
/**
 * removeSockeIdFromArray() - удаляет socketId из массива, если произошел
 * дисконнект
 * @param {String} socketId
 */
const removeSockeIdFromArray = async (socketId) => {
  // console.log('removeSockeIdFromArray socketId: ', socketId)
  const foundIndex = notifyIdArray.findIndex((element) => element === socketId);
  // console.log(notifyIdArray)
  if (foundIndex >= 0) {
    // console.log(foundIndex)
    const removingElement = notifyIdArray.splice(foundIndex, 1);
    console.log('removeSockeIdFromArray array: ', notifyIdArray);
    const messageBody = JSON.stringify({
      removedItemsArray: notifyIdArray,
    });
    loggerFunction('addSocketId', filePath, await statusAnswer(false, '00', 'removeSockeIdFromArray', messageBody), 'warn');

    return removingElement;
  }
  errorBody = await statusAnswer(true, '04', 'Такой элемент не найден', { elem: socketId });
  loggerFunction('addSocketId', filePath, errorBody, 'warn');

  return errorBody;
};

export {
  addSocketId,
  getSocketIdArray,
  removeSockeIdFromArray,
};
