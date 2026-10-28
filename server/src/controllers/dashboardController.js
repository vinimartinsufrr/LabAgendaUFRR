const Usuario = require('../models/Usuario');
const Laboratorio = require('../models/Laboratorio');
const Agendamento = require('../models/Agendamento');
const asyncHandler = require('../utils/asyncHandler');
const { hoje, somarDias } = require('../utils/datas');

// GET /api/dashboard  (somente admin) - números gerais do sistema
const resumo = asyncHandler(async (req, res) => {
  const dataHoje = hoje();
  const daquiSeteDias = somarDias(dataHoje, 6);

  const [
    totalUsuarios,
    totalLaboratorios,
    laboratoriosAtivos,
    agendamentosConfirmados,
    agendamentosCancelados,
    agendamentosHoje,
    proximosPorDia,
    maisAgendados,
  ] = await Promise.all([
    Usuario.countDocuments(),
    Laboratorio.countDocuments(),
    Laboratorio.countDocuments({ ativo: true }),
    Agendamento.countDocuments({ status: 'confirmado' }),
    Agendamento.countDocuments({ status: 'cancelado' }),
    Agendamento.countDocuments({ status: 'confirmado', data: dataHoje }),
    // Quantidade de agendamentos confirmados em cada um dos próximos 7 dias
    Agendamento.aggregate([
      { $match: { status: 'confirmado', data: { $gte: dataHoje, $lte: daquiSeteDias } } },
      { $group: { _id: '$data', total: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    // Laboratórios com mais agendamentos confirmados
    Agendamento.aggregate([
      { $match: { status: 'confirmado' } },
      { $group: { _id: '$laboratorio', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'laboratorios', localField: '_id', foreignField: '_id', as: 'lab' } },
      { $unwind: '$lab' },
      { $project: { _id: 1, total: 1, nome: '$lab.nome', bloco: '$lab.bloco' } },
    ]),
  ]);

  // Preenche os dias sem agendamento com zero
  const porDia = Object.fromEntries(proximosPorDia.map((d) => [d._id, d.total]));
  const proximosDias = Array.from({ length: 7 }, (_, i) => {
    const data = somarDias(dataHoje, i);
    return { data, total: porDia[data] || 0 };
  });

  res.json({
    totalUsuarios,
    totalLaboratorios,
    laboratoriosAtivos,
    agendamentosConfirmados,
    agendamentosCancelados,
    agendamentosHoje,
    proximosDias,
    maisAgendados,
  });
});

module.exports = { resumo };
