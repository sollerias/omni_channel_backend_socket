/**
 * File: notify.js
 * -----------------
 * Валидирует данные файла services/notify.js.
 */
import Joi from '@hapi/joi';
import loggerFunction from '../logger';

const filePath = __filename;

const socketIdValidation = async (socketId) => {
  const schema = Joi.string().required();

  try {
    const result = await schema.validateAsync(socketId);

    return result;
  } catch (err) {
    const logInfo = JSON.stringify({ catchError: err.details });
    loggerFunction('socketIdValidation', filePath, logInfo, 'error');

    return { catchError: err.details };
  }
};

export default socketIdValidation;
