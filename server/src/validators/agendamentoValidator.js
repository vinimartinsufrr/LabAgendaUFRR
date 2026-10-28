const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const data = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).label('Data');

const criar = Joi.object({
  laboratorio: objectId.required().label('Laboratório'),
  data: data.required(),
  horaInicio: Joi.number().integer().min(0).max(23).required().label('Hora de início'),
  horaFim: Joi.number()
    .integer()
    .min(1)
    .max(24)
    .greater(Joi.ref('horaInicio'))
    .required()
    .label('Hora de fim')
    .messages({ 'number.greater': 'A hora de fim deve ser depois da hora de início' }),
  motivo: Joi.string().trim().min(3).max(200).required().label('Motivo'),
});

const atualizar = Joi.object({
  laboratorio: objectId.label('Laboratório'),
  data,
  horaInicio: Joi.number().integer().min(0).max(23).label('Hora de início'),
  horaFim: Joi.number().integer().min(1).max(24).label('Hora de fim'),
  motivo: Joi.string().trim().min(3).max(200).label('Motivo'),
}).min(1);

const disponibilidade = Joi.object({
  laboratorio: objectId.required().label('Laboratório'),
  data: data.required(),
});

const filtros = Joi.object({
  laboratorio: objectId.label('Laboratório'),
  usuario: objectId.label('Usuário'),
  data,
  status: Joi.string().valid('confirmado', 'cancelado').label('Status'),
  periodo: Joi.string().valid('futuros', 'passados').label('Período'),
});

module.exports = { criar, atualizar, disponibilidade, filtros };
