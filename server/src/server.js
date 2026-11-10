require('dotenv').config();

const http = require('http');
const app = require('./app');
const conectarBanco = require('./config/db');
const iniciarSocket = require('./socket');

const PORT = process.env.PORT || 3333;

async function iniciar() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não definido. Copie o .env.example para .env e configure.');
    }
    await conectarBanco(process.env.MONGO_URI);

    // Express e Socket.io compartilham o mesmo servidor HTTP
    const httpServer = http.createServer(app);
    const io = iniciarSocket(httpServer);
    app.set('io', io);

    httpServer.listen(PORT, () => {
      console.log(`[api] Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error('[api] Falha ao iniciar o servidor:', erro.message);
    process.exit(1);
  }
}

iniciar();
