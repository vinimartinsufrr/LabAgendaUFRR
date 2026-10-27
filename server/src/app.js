const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const rotas = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

// O app é separado do server.js para poder ser importado em testes
const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api', rotas);

// Middlewares de fim de pipeline: rota inexistente e tratamento central de erros
app.use(notFound);
app.use(errorHandler);

module.exports = app;
