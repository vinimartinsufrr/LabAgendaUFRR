const Usuario = require('../models/Usuario');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const gerarToken = require('../utils/gerarToken');

// POST /api/auth/registro  (público - sempre cria um usuário comum)
const registro = asyncHandler(async (req, res) => {
  const existe = await Usuario.exists({ email: req.body.email });
  if (existe) throw new AppError('Este e-mail já está cadastrado', 409);

  const usuario = await Usuario.create({ ...req.body, papel: 'usuario' });
  res.status(201).json({ usuario, token: gerarToken(usuario) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ email }).select('+senha');

  // Mesma mensagem para e-mail inexistente e senha errada (não revela quais e-mails existem)
  if (!usuario || !(await usuario.compararSenha(senha))) {
    throw new AppError('E-mail ou senha incorretos', 401);
  }

  res.json({ usuario, token: gerarToken(usuario) });
});

// GET /api/auth/me  (retorna o usuário dono do token)
const me = asyncHandler(async (req, res) => {
  res.json(req.usuario);
});

module.exports = { registro, login, me };
