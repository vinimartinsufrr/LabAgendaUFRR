const jwt = require('jsonwebtoken');

// O token carrega apenas o id e o papel; os demais dados são buscados no banco
function gerarToken(usuario) {
  return jwt.sign({ id: usuario._id, papel: usuario.papel }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

module.exports = gerarToken;
