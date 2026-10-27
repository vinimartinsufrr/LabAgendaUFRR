// Erro de aplicação com status HTTP, tratado pelo errorHandler
class AppError extends Error {
  constructor(mensagem, status = 400, detalhes) {
    super(mensagem);
    this.name = 'AppError';
    this.status = status;
    this.detalhes = detalhes;
  }
}

module.exports = AppError;
