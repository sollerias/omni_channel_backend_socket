// const path = require('path');
// // Начало: Логирование

// // const notifyIdArray = [ 1, 2, 3, 4, 'pizza']
// const notifyIdArray = []
// let errorBody = ''
// /**
//  * addSocketId() - добовляет эксклюзивный socketId в массив
//  * notifyIdArray
//  * @param {string} socketId 
//  */
// const addSocketId = (socketId) => {
//     let journalName = 'notify/addSocketId'
//     const checkExistence = notifyIdArray.includes(socketId)
//     if (!checkExistence) {
//         let addElementToArray = notifyIdArray.push(socketId)
//         messageBody = {
//             addItemsArray: notifyIdArray
//         }
//         console.log('addSocketId: ', notifyIdArray)
//         logging.writeLog(logDirectory, dirname, fileName, journalName, JSON.stringify(messageBody))
//         return addElementToArray
//     } else {
//         errorBody = {
//             error: 'Такой элемент уже существует'
//         }
//         console.log(errorBody)
//         logging.writeLog(errorLogDirectory, dirname, fileName, journalName, JSON.stringify(errorBody))
//         return errorBody
//     }
// }
// /**
//  * getSocketIdArray() - возвращает массив ID сокетов
//  */
// const getSocketIdArray = () => {
//     // console.log('getSocketIdArray notifyIdArray: ', notifyIdArray)
//     return notifyIdArray
// }
// /**
//  * removeSockeIdFromArray() - удаляет socketId из массива, если произошел
//  * дисконнект
//  * @param {String} socketId 
//  */
// const removeSockeIdFromArray = (socketId) => {
//     let journalName = 'notify/removeSockeIdFromArray'
//     // console.log('removeSockeIdFromArray socketId: ', socketId)
//     let foundIndex = notifyIdArray.findIndex((element, index) =>{
//         // console.log('removeSockeIdFromArray: ', element, ' | socketId: ', socketId, ' | index: ', index)
//         return element === socketId
//     })
//     // console.log(notifyIdArray)
//     if (foundIndex >= 0) {
//         // console.log(foundIndex)
//         let removingElement = notifyIdArray.splice(foundIndex, 1)
//         console.log('removeSockeIdFromArray array: ', notifyIdArray)
//         messageBody = {
//             removedItemsArray: notifyIdArray
//         }
//         logging.writeLog(logDirectory, dirname, fileName, journalName, JSON.stringify(messageBody))
//         return removingElement
//     } else {
//         errorBody = {
//             error: 'Такой элемент не найден'
//         }
//         // console.log(errorBody)
//         logging.writeLog(errorLogDirectory, dirname, fileName, journalName, JSON.stringify(errorBody))
//         return errorBody
//     }
// }

// module.exports = {
//     addSocketId,
//     getSocketIdArray,
//     removeSockeIdFromArray
// }