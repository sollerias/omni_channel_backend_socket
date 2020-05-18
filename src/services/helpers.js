/**
 * File: helpers.js
 * -----------------
 * Заданы вспомогательные функции.
 */

import {
  statusAnswerValidation,
  encodeDataValidation,
} from './validations/helpers';


export const parseError = (err) => {
  // console.log('!!!!', err);
  if (err.isJoi) { return err.details[0]; }
  return JSON.stringify(err, Object.getOwnPropertyNames(err));
};

/**
 * statusAnswer() - возвращает клиенту подготовленный объект с данными
 * по запросу .
 * @param {boolean} error - наличие ошибки в запросе от клиента
 * @param {string} status - статус ошибки или статус 00 - запрос выполнен
 * @param {string} text - текст ошибки или ОК - запрос выполнен
 * @param {multiple} value - различного рода данные
 */
export const statusAnswer = async (error, status, text, value = null) => {
  const validation = await statusAnswerValidation(error, status, text, value);

  return validation;
};

/**
 * encodeData() - кодирует данные в кодировку base64
 * @param {string or object} data - строка или объект
 */
export const encodeData = async (data) => {
  const validation = await encodeDataValidation(data);
  let buff = null;

  if (Object.prototype.hasOwnProperty.call(validation, 'catchError')) {
    const result = await statusAnswer(true, '03', 'Wrong encoded data', validation);
    return result;
  }

  if (typeof validation === 'string') {
    buff = Buffer.from(validation);
  } else {
    buff = Buffer.from(JSON.stringify(validation));
  }

  const base64data = buff.toString('base64');

  return base64data;
};
