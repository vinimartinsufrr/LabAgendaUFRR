require('dotenv').config();

const app = require('./app');
const conectarBanco = require('./config/db');

const PORT = process.env.PORT || 3333;

async function iniciar() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não definido. Copie o .env.example para .env e configure.');
    }
    await conectarBanco(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`[api] Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error('[api] Falha ao iniciar o servidor:', erro.message);
    process.exit(1);
  }
}

iniciar();
