const Usuario = require('../models/Usuario');
const Agendamento = require('../models/Agendamento');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const ehAdmin = (req) => req.usuario.papel === 'admin';
const ehOProprio = (req) => req.usuario._id.equals(req.params.id);

// GET /api/usuarios  (admin)
const listar = asyncHandler(async (req, res) => {
  const usuarios = await Usuario.find().sort({ nome: 1 });
  res.json(usuarios);
});

// GET /api/usuarios/:id  (admin ou o próprio usuário)
const buscarPorId = asyncHandler(async (req, res) => {
  if (!ehAdmin(req) && !ehOProprio(req)) {
    throw new AppError('Você não tem permissão para ver este usuário', 403);
  }
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) throw new AppError('Usuário não encontrado', 404);
  res.json(usuario);
});

// POST /api/usuarios  (admin - pode definir o papel)
const criar = asyncHandler(async (req, res) => {
  const existe = await Usuario.exists({ email: req.body.email });
  if (existe) throw new AppError('Este e-mail já está cadastrado', 409);

  const usuario = await Usuario.create(req.body);
  res.status(201).json(usuario);
});

// PUT /api/usuarios/:id  (admin ou o próprio usuário)
const atualizar = asyncHandler(async (req, res) => {
  if (!ehAdmin(req) && !ehOProprio(req)) {
    throw new AppError('Você não tem permissão para alterar este usuário', 403);
  }
  if (req.body.papel && !ehAdmin(req)) {
    throw new AppError('Apenas administradores podem alterar o papel', 403);
  }
  if (req.body.papel && ehOProprio(req) && req.body.papel !== 'admin') {
    throw new AppError('Você não pode remover o seu próprio acesso de administrador', 400);
  }

  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) throw new AppError('Usuário não encontrado', 404);

  if (req.body.email && req.body.email !== usuario.email) {
    const emailEmUso = await Usuario.exists({ email: req.body.email });
    if (emailEmUso) throw new AppError('Este e-mail já está cadastrado', 409);
  }

  // save() dispara o hook que gera o hash caso a senha tenha sido alterada
  usuario.set(req.body);
  await usuario.save();
  res.json(usuario);
});

// DELETE /api/usuarios/:id  (admin)
const remover = asyncHandler(async (req, res) => {
  if (ehOProprio(req)) {
    throw new AppError('Você não pode remover a sua própria conta', 400);
  }
  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  if (!usuario) throw new AppError('Usuário não encontrado', 404);

  // Remove os agendamentos do usuário para não deixar referências órfãs
  await Agendamento.deleteMany({ usuario: usuario._id });
  res.status(204).send();
});

module.exports = { listar, buscarPorId, criar, atualizar, remover };
