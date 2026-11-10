const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { origensPermitidas } = require('./config/cors');

// Configura o Socket.io em cima do servidor HTTP.
// Só aceita conexões com token JWT válido e separa os clientes em salas:
//   "admins"          -> todos os administradores
//   "usuario:<id>"    -> cada usuário individualmente
function iniciarSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: origensPermitidas() },
  });

  io.use((socket, next) => {
    try {
      const { id, papel } = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      socket.data.usuario = { id, papel };
      next();
    } catch {
      next(new Error('Não autorizado'));
    }
  });

  io.on('connection', (socket) => {
    const { id, papel } = socket.data.usuario;
    socket.join(`usuario:${id}`);
    if (papel === 'admin') socket.join('admins');
  });

  return io;
}

module.exports = iniciarSocket;
