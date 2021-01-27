/**
 * File: helpers.js
 * -----------------
 * Валидирует данные файла src/utils/helpers.js.
 */
import Joi from '@hapi/joi';
import loggerFunction from '../logger';

const filePath = __filename;

/**
 * statusAnswerValidation() - валидирует функцию statusAnswer()
 * @param {boolean} error - есть ошибка или нет
 * @param {string} status - статус ответа
 * @param {string} text - текст ответа
 * @param {multiple} value - данные ответа (если есть)
 */
export const statusAnswerValidation = async (error, status, text, value) => {
  const schema = Joi.object({
    error: Joi.boolean()
      .required(),

    status: Joi.string()
      .required(),

    text: Joi.string()
      .required(),

    value: Joi.alternatives().try(Joi.string(), Joi.object()).allow(null),
    // value: Joi.string()
    //   .allow(null),
  });

  try {
    const result = await schema.validateAsync({
      error, status, text, value,
    });

    return result;
  } catch (err) {
    const logInfo = JSON.stringify({ catchError: err.details });
    loggerFunction('statusAnswerValidation', filePath, logInfo, 'warn');
    return { catchError: err.details };
  }
};

/**
 * encodeDataValidation() - валидирует данные ф-ии encodeData()
 * @param {multiple} data - объект или строка
 */
export const encodeDataValidation = async (data) => {
  let result = null;
  const schemaForObject = Joi.object()
    .required();
  const schemaForString = Joi.string()
    .required();
  if (typeof data === 'string') {
    try {
      result = await schemaForString.validateAsync(data);
      return result;
    } catch (err) {
      const logInfo = JSON.stringify({ catchError: err.details });
      loggerFunction('encodeDataValidation', filePath, logInfo, 'warn');
      return { catchError: err.details };
    }
  } else {
    try {
      result = await schemaForObject.validateAsync(data);
      return result;
    } catch (err) {
      const logInfo = JSON.stringify({ catchError: err.details });
      loggerFunction('encodeDataValidation', filePath, logInfo, 'warn');
      return { catchError: err.details };
    }
  }
};
