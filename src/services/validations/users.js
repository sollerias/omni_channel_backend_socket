/**
 * File: users.js
 * -----------------
 * Валидирует данные файла services/users.js.
 */
import Joi from '@hapi/joi';
import loggerFunction from '../logger';

const filePath = __filename;

export const authorizeValidation = async (authObj) => {
  console.log('05', authObj);
  const schema = Joi.object().keys({
    userId: Joi.number().integer().prefs({ convert: false }).required(),
    socketId: Joi.string().required(),
    page: Joi.string().lowercase(),
  }).required();

  try {
    const result = await schema.validateAsync(authObj);
    console.log('06', result);

    return result;
  } catch (err) {
    const logInfo = JSON.stringify({ catchError: err.details });
    loggerFunction('logoutValidation', filePath, logInfo, 'error');
    console.log('07', err);

    return { catchError: err.details };
  }
};

export const logoutValidation = async (data) => {
  const schema = Joi.number().integer().min(1).required();

  try {
    const result = await schema.validateAsync(data);

    return result;
  } catch (err) {
    const logInfo = JSON.stringify({ catchError: err.details });
    loggerFunction('logoutValidation', filePath, logInfo, 'error');

    return { catchError: err.details };
  }
};

export const logoutEveryWhereValidation = async (logoutObject) => {
  const schema = Joi.object().keys({
    userId: Joi.number().integer().required(),
    page: Joi.string().lowercase().required(),
  }).required();

  try {
    const result = await schema.validateAsync(logoutObject);

    return result;
  } catch (err) {
    const logInfo = JSON.stringify({ catchError: err.details });
    loggerFunction('logoutEveryWhereValidation', filePath, logInfo, 'error');

    return { catchError: err.details };
  }
};

export const getLogoutUserValidation = async (userId) => {
  const schema = Joi.number().integer().required();

  try {
    const result = await schema.validateAsync(userId);

    return result;
  } catch (err) {
    const logInfo = JSON.stringify({ catchError: err.details });
    loggerFunction('getLogoutUserValidation', filePath, logInfo, 'error');

    return { catchError: err.details };
  }
};

export const disconnectValidation = async (data) => {
  const schema = Joi.string().required();

  try {
    const result = await schema.validateAsync(data);

    return result;
  } catch (err) {
    const logInfo = JSON.stringify({ catchError: err.details });
    loggerFunction('disconnectValidation', filePath, logInfo, 'error');

    return { catchError: err.details };
  }
};
