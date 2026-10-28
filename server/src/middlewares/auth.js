const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// AuthN: exige um token JWT válido no cabeçalho Authorization: Bearer <token>
const autenticar = asyncHandler(async (req, res, next) => {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw new AppError('Token não informado', 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Token inválido ou expirado', 401);
  }

  // Busca o usuário no banco: se ele foi removido ou teve o papel alterado, vale o dado atual
  const usuario = await Usuario.findById(payload.id);
  if (!usuario) {
    throw new AppError('Usuário do token não existe mais', 401);
  }

  req.usuario = usuario;
  next();
});

// AuthZ: libera apenas os papéis informados. Ex: autorizar('admin')
const autorizar =
  (...papeis) =>
  (req, res, next) => {
    if (!req.usuario || !papeis.includes(req.usuario.papel)) {
      return next(new AppError('Você não tem permissão para esta ação', 403));
    }
    next();
  };

module.exports = { autenticar, autorizar };
