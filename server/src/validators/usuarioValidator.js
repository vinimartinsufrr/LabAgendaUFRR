const Joi = require('joi');
const Usuario = require('../models/Usuario');

// Usado pelo admin para cadastrar usuários já com o papel definido
const criar = Joi.object({
  nome: Joi.string().trim().min(3).max(100).required().label('Nome'),
  email: Joi.string().trim().lowercase().email().required().label('E-mail'),
  senha: Joi.string().min(6).max(72).required().label('Senha'),
  matricula: Joi.string().trim().max(20).allow('').label('Matrícula'),
  papel: Joi.string().valid(...Usuario.PAPEIS).label('Papel'),
});

// O controller ainda garante que só o admin consegue mudar o papel
const atualizar = Joi.object({
  nome: Joi.string().trim().min(3).max(100).label('Nome'),
  email: Joi.string().trim().lowercase().email().label('E-mail'),
  senha: Joi.string().min(6).max(72).label('Senha'),
  matricula: Joi.string().trim().max(20).allow('').label('Matrícula'),
  papel: Joi.string().valid(...Usuario.PAPEIS).label('Papel'),
}).min(1);

module.exports = { criar, atualizar };
