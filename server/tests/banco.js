// Banco MongoDB em memória para os testes (não precisa de Mongo instalado)
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'segredo-de-teste';
process.env.NODE_ENV = 'test';

let mongo;

async function conectar() {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}

async function limpar() {
  const colecoes = await mongoose.connection.db.collections();
  await Promise.all(colecoes.map((c) => c.deleteMany({})));
}

async function desconectar() {
  await mongoose.disconnect();
  await mongo.stop();
}

module.exports = { conectar, limpar, desconectar };
