const Joi = require('joi');

const campos = {
  nome: Joi.string().trim().min(3).max(80).label('Nome'),
  bloco: Joi.string().trim().min(1).max(40).label('Bloco'),
  capacidade: Joi.number().integer().min(1).max(200).label('Capacidade'),
  descricao: Joi.string().trim().max(500).allow('').label('Descrição'),
  recursos: Joi.array().items(Joi.string().trim().max(40)).max(20).label('Recursos'),
  horaAbertura: Joi.number().integer().min(0).max(23).label('Hora de abertura'),
  horaFechamento: Joi.number().integer().min(1).max(24).label('Hora de fechamento'),
  ativo: Joi.boolean().label('Ativo'),
};

const criar = Joi.object({
  ...campos,
  nome: campos.nome.required(),
  bloco: campos.bloco.required(),
  capacidade: campos.capacidade.required(),
});

const atualizar = Joi.object(campos).min(1);

module.exports = { criar, atualizar };
