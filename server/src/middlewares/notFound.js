function notFound(req, res) {
  res.status(404).json({ mensagem: `Rota ${req.method} ${req.originalUrl} não encontrada` });
}

module.exports = notFound;
