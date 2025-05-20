const jwt = require('jsonwebtoken');
const getToken = require('./get-token');

// Middleware para verificar se o usuário está autenticado
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: 'Acesso negado!' });
  }

  try {
    const token = getToken(req);
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'supersecreto');
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido!' });
  }
};

module.exports = verifyToken;