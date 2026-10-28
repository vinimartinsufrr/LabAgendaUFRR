const Laboratorio = require('../models/Laboratorio');
const Agendamento = require('../models/Agendamento');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Escapa caracteres especiais para a busca não ser interpretada como regex
const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/laboratorios?busca=&bloco=&ativo=
const listar = asyncHandler(async (req, res) => {
  const { busca, bloco, ativo } = req.query;
  const filtro = {};

  if (busca) filtro.nome = { $regex: escaparRegex(String(busca)), $options: 'i' };
  if (bloco) filtro.bloco = bloco;
  if (ativo !== undefined) filtro.ativo = ativo === 'true';

  const laboratorios = await Laboratorio.find(filtro).sort({ nome: 1 });
  res.json(laboratorios);
});

// GET /api/laboratorios/:id
const buscarPorId = asyncHandler(async (req, res) => {
  const laboratorio = await Laboratorio.findById(req.params.id);
  if (!laboratorio) throw new AppError('Laboratório não encontrado', 404);
  res.json(laboratorio);
});

// POST /api/laboratorios
const criar = asyncHandler(async (req, res) => {
  const laboratorio = await Laboratorio.create(req.body);
  res.status(201).json(laboratorio);
});

// PUT /api/laboratorios/:id
const atualizar = asyncHandler(async (req, res) => {
  const laboratorio = await Laboratorio.findById(req.params.id);
  if (!laboratorio) throw new AppError('Laboratório não encontrado', 404);

  // set + save (em vez de findByIdAndUpdate) para rodar todas as validações do schema
  laboratorio.set(req.body);
  await laboratorio.save();
  res.json(laboratorio);
});

// DELETE /api/laboratorios/:id
const remover = asyncHandler(async (req, res) => {
  const laboratorio = await Laboratorio.findByIdAndDelete(req.params.id);
  if (!laboratorio) throw new AppError('Laboratório não encontrado', 404);

  // Remove os agendamentos do laboratório para não deixar referências órfãs
  await Agendamento.deleteMany({ laboratorio: laboratorio._id });
  res.status(204).send();
});

module.exports = { listar, buscarPorId, criar, atualizar, remover };
