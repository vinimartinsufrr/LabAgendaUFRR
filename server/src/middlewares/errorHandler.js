// Tratamento centralizado de erros: sempre responde JSON com { mensagem, detalhes? }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Erros de validação do Mongoose
  if (err.name === 'ValidationError') {
    const detalhes = Object.values(err.errors).map((e) => ({ campo: e.path, mensagem: e.message }));
    return res.status(400).json({ mensagem: 'Dados inválidos', detalhes });
  }

  // ObjectId mal formatado (ex: /api/laboratorios/123)
  if (err.name === 'CastError') {
    return res.status(400).json({ mensagem: `Valor inválido para o campo ${err.path}` });
  }

  // Violação de índice único (ex: nome de laboratório repetido)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ mensagem: `Já existe um registro com este ${campo}` });
  }

  const status = err.status || 500;
  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    mensagem: status === 500 ? 'Erro interno do servidor' : err.message,
    ...(err.detalhes && { detalhes: err.detalhes }),
  });
}

module.exports = errorHandler;
