const Agendamento = require('../models/Agendamento');
const Laboratorio = require('../models/Laboratorio');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { hoje, dataValida, jaPassou } = require('../utils/datas');

const POPULAR = [
  { path: 'laboratorio', select: 'nome bloco' },
  { path: 'usuario', select: 'nome email matricula' },
];

const ehAdmin = (req) => req.usuario.papel === 'admin';

// Busca o agendamento e garante que quem pediu é o dono ou um admin
async function buscarComPermissao(req) {
  const agendamento = await Agendamento.findById(req.params.id);
  if (!agendamento) throw new AppError('Agendamento não encontrado', 404);
  if (!ehAdmin(req) && !agendamento.usuario.equals(req.usuario._id)) {
    throw new AppError('Você não tem permissão para acessar este agendamento', 403);
  }
  return agendamento;
}

// Regras de negócio de um horário: laboratório ativo, dentro do expediente,
// no futuro e sem choque com outro agendamento confirmado
async function validarHorario({ laboratorio, data, horaInicio, horaFim }, ignorarId) {
  if (!dataValida(data)) throw new AppError('Data inválida', 400);
  if (horaFim <= horaInicio) {
    throw new AppError('A hora de fim deve ser depois da hora de início', 400);
  }
  if (jaPassou(data, horaInicio)) {
    throw new AppError('Não é possível agendar um horário que já passou', 400);
  }

  const lab = await Laboratorio.findById(laboratorio);
  if (!lab) throw new AppError('Laboratório não encontrado', 404);
  if (!lab.ativo) throw new AppError('Este laboratório está desativado para agendamentos', 400);
  if (horaInicio < lab.horaAbertura || horaFim > lab.horaFechamento) {
    throw new AppError(
      `O laboratório funciona das ${lab.horaAbertura}h às ${lab.horaFechamento}h`,
      400
    );
  }

  // Dois intervalos se sobrepõem quando um começa antes do outro terminar
  const conflito = await Agendamento.findOne({
    laboratorio,
    data,
    status: 'confirmado',
    horaInicio: { $lt: horaFim },
    horaFim: { $gt: horaInicio },
    ...(ignorarId && { _id: { $ne: ignorarId } }),
  });
  if (conflito) {
    throw new AppError(
      `Horário indisponível: já existe agendamento das ${conflito.horaInicio}h às ${conflito.horaFim}h`,
      409
    );
  }
}

// GET /api/agendamentos  (admin vê todos; usuário comum vê só os seus)
const listar = asyncHandler(async (req, res) => {
  const { laboratorio, usuario, data, status, periodo } = req.query;
  const filtro = {};

  if (laboratorio) filtro.laboratorio = laboratorio;
  if (data) filtro.data = data;
  if (status) filtro.status = status;
  if (periodo === 'futuros') filtro.data = { $gte: hoje() };
  if (periodo === 'passados') filtro.data = { $lt: hoje() };

  if (ehAdmin(req)) {
    if (usuario) filtro.usuario = usuario;
  } else {
    filtro.usuario = req.usuario._id;
  }

  const ordem = periodo === 'futuros' ? 1 : -1;
  const agendamentos = await Agendamento.find(filtro)
    .populate(POPULAR)
    .sort({ data: ordem, horaInicio: ordem });
  res.json(agendamentos);
});

// GET /api/agendamentos/disponibilidade?laboratorio=&data=
// Retorna o horário de funcionamento e os intervalos já ocupados no dia
const disponibilidade = asyncHandler(async (req, res) => {
  const { laboratorio, data } = req.query;

  const lab = await Laboratorio.findById(laboratorio);
  if (!lab) throw new AppError('Laboratório não encontrado', 404);

  const agendamentos = await Agendamento.find({ laboratorio, data, status: 'confirmado' }).sort({
    horaInicio: 1,
  });

  res.json({
    laboratorio: {
      _id: lab._id,
      nome: lab.nome,
      horaAbertura: lab.horaAbertura,
      horaFechamento: lab.horaFechamento,
      ativo: lab.ativo,
    },
    data,
    ocupados: agendamentos.map((a) => ({
      _id: a._id,
      horaInicio: a.horaInicio,
      horaFim: a.horaFim,
      meu: a.usuario.equals(req.usuario._id),
    })),
  });
});

// GET /api/agendamentos/:id
const buscarPorId = asyncHandler(async (req, res) => {
  const agendamento = await buscarComPermissao(req);
  await agendamento.populate(POPULAR);
  res.json(agendamento);
});

// POST /api/agendamentos
const criar = asyncHandler(async (req, res) => {
  await validarHorario(req.body);

  const agendamento = await Agendamento.create({ ...req.body, usuario: req.usuario._id });
  await agendamento.populate(POPULAR);
  res.status(201).json(agendamento);
});

// PUT /api/agendamentos/:id  (dono ou admin; apenas agendamentos confirmados)
const atualizar = asyncHandler(async (req, res) => {
  const agendamento = await buscarComPermissao(req);
  if (agendamento.status === 'cancelado') {
    throw new AppError('Não é possível alterar um agendamento cancelado', 400);
  }

  const dados = {
    laboratorio: req.body.laboratorio || agendamento.laboratorio,
    data: req.body.data || agendamento.data,
    horaInicio: req.body.horaInicio ?? agendamento.horaInicio,
    horaFim: req.body.horaFim ?? agendamento.horaFim,
  };
  await validarHorario(dados, agendamento._id);

  agendamento.set({ ...dados, motivo: req.body.motivo ?? agendamento.motivo });
  await agendamento.save();
  await agendamento.populate(POPULAR);
  res.json(agendamento);
});

// PATCH /api/agendamentos/:id/cancelar  (dono ou admin)
const cancelar = asyncHandler(async (req, res) => {
  const agendamento = await buscarComPermissao(req);
  if (agendamento.status === 'cancelado') {
    throw new AppError('Este agendamento já está cancelado', 400);
  }

  agendamento.status = 'cancelado';
  await agendamento.save();
  await agendamento.populate(POPULAR);
  res.json(agendamento);
});

// DELETE /api/agendamentos/:id  (somente admin)
const remover = asyncHandler(async (req, res) => {
  const agendamento = await Agendamento.findByIdAndDelete(req.params.id);
  if (!agendamento) throw new AppError('Agendamento não encontrado', 404);
  res.status(204).send();
});

module.exports = { listar, disponibilidade, buscarPorId, criar, atualizar, cancelar, remover };
