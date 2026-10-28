const Joi = require('joi');

const registro = Joi.object({
  nome: Joi.string().trim().min(3).max(100).required().label('Nome'),
  email: Joi.string().trim().lowercase().email().required().label('E-mail'),
  senha: Joi.string().min(6).max(72).required().label('Senha'),
  matricula: Joi.string().trim().max(20).allow('').label('Matrícula'),
});

const login = Joi.object({
  email: Joi.string().trim().lowercase().email().required().label('E-mail'),
  senha: Joi.string().required().label('Senha'),
});

module.exports = { registro, login };
