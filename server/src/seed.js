// Popula o banco com um admin, um usuário comum e alguns laboratórios.
// Pode ser executado mais de uma vez: só cria o que ainda não existe.
require('dotenv').config();

const mongoose = require('mongoose');
const conectarBanco = require('./config/db');
const Usuario = require('./models/Usuario');
const Laboratorio = require('./models/Laboratorio');

const usuarios = [
  {
    nome: 'Administrador',
    email: process.env.ADMIN_EMAIL || 'admin@ufrr.br',
    senha: process.env.ADMIN_SENHA || 'admin123',
    papel: 'admin',
  },
  {
    nome: 'Usuário Comum',
    email: 'usuario@ufrr.br',
    senha: 'usuario123',
    matricula: '2023000001',
    papel: 'usuario',
  },
];

const laboratorios = [
  {
    nome: 'Laboratório de Informática 1',
    bloco: 'Bloco III',
    capacidade: 30,
    descricao: '30 computadores com Linux e Windows.',
    recursos: ['Projetor', 'Ar-condicionado', 'Quadro branco'],
    horaAbertura: 8,
    horaFechamento: 22,
  },
  {
    nome: 'Laboratório de Redes',
    bloco: 'Bloco III',
    capacidade: 20,
    descricao: 'Switches, roteadores e racks para práticas de redes.',
    recursos: ['Projetor', 'Rack Cisco', 'Ar-condicionado'],
    horaAbertura: 8,
    horaFechamento: 18,
  },
  {
    nome: 'Laboratório de Química Geral',
    bloco: 'Bloco V',
    capacidade: 25,
    descricao: 'Bancadas, capela de exaustão e chuveiro de emergência.',
    recursos: ['Capela', 'Bancadas', 'EPI'],
    horaAbertura: 7,
    horaFechamento: 17,
  },
  {
    nome: 'Laboratório de Física Experimental',
    bloco: 'Bloco IV',
    capacidade: 24,
    descricao: 'Kits de mecânica, óptica e eletromagnetismo.',
    recursos: ['Osciloscópios', 'Kits didáticos'],
    horaAbertura: 8,
    horaFechamento: 20,
  },
];

async function seed() {
  await conectarBanco(process.env.MONGO_URI);

  for (const dados of usuarios) {
    if (await Usuario.exists({ email: dados.email })) {
      console.log(`[seed] usuário ${dados.email} já existe`);
      continue;
    }
    await Usuario.create(dados);
    console.log(`[seed] usuário criado: ${dados.email} / ${dados.senha} (${dados.papel})`);
  }

  for (const dados of laboratorios) {
    if (await Laboratorio.exists({ nome: dados.nome })) {
      console.log(`[seed] laboratório "${dados.nome}" já existe`);
      continue;
    }
    await Laboratorio.create(dados);
    console.log(`[seed] laboratório criado: ${dados.nome}`);
  }
}

seed()
  .catch((erro) => {
    console.error('[seed] erro:', erro.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
