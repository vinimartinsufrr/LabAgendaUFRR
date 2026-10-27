const mongoose = require('mongoose');

// Abre a conexão com o MongoDB usando a URI definida no .env
async function conectarBanco(uri) {
  if (!uri) {
    throw new Error('MONGO_URI não definida. Copie o .env.example para .env e configure.');
  }

  await mongoose.connect(uri);
  console.log(`[db] MongoDB conectado em ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = conectarBanco;
