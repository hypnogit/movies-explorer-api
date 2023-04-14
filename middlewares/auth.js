const jsonwebtoken = require('jsonwebtoken');
const { Unauthorized } = require('../utils/Unauthorized');

const { JWT_SECRET, NODE_ENV } = process.env;

module.exports.auth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next(new Unauthorized('Ошибка авторизации'));
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jsonwebtoken.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key');
  } catch (error) {
    return next(new Unauthorized('Ошибка авторизации'));
  }
  req.user = payload;
  return next();
};
