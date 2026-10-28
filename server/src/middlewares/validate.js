const AppError = require('../utils/AppError');
const mensagens = require('../validators/mensagens');

// Valida req.body (ou req.query) com um schema Joi.
// stripUnknown remove campos não previstos: o backend não confia no que o frontend manda.
const validate =
  (schema, origem = 'body') =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[origem], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
      messages: mensagens,
      errors: { wrap: { label: false } },
    });

    if (error) {
      const detalhes = error.details.map((d) => ({
        campo: d.path.join('.'),
        mensagem: d.message,
      }));
      return next(new AppError('Dados inválidos', 400, detalhes));
    }

    req[origem] = value;
    next();
  };

module.exports = validate;
