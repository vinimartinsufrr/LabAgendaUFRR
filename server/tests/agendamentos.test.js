const request = require('supertest');
const banco = require('./banco');
const app = require('../src/app');
const Usuario = require('../src/models/Usuario');
const Laboratorio = require('../src/models/Laboratorio');
const gerarToken = require('../src/utils/gerarToken');
const { hoje, somarDias } = require('../src/utils/datas');

beforeAll(banco.conectar);
afterAll(banco.desconectar);

let tokenAdmin;
let tokenMaria;
let tokenJoao;
let lab;
const amanha = somarDias(hoje(), 1);

beforeEach(async () => {
  await banco.limpar();
  const admin = await Usuario.create({ nome: 'Admin', email: 'admin@ufrr.br', senha: 'admin123', papel: 'admin' });
  const maria = await Usuario.create({ nome: 'Maria', email: 'maria@ufrr.br', senha: '123456' });
  const joao = await Usuario.create({ nome: 'João', email: 'joao@ufrr.br', senha: '123456' });
  tokenAdmin = gerarToken(admin);
  tokenMaria = gerarToken(maria);
  tokenJoao = gerarToken(joao);
  lab = await Laboratorio.create({ nome: 'Lab Info', bloco: 'III', capacidade: 30, horaAbertura: 8, horaFechamento: 18 });
});

const agendar = (token, dados) =>
  request(app)
    .post('/api/agendamentos')
    .set('Authorization', `Bearer ${token}`)
    .send({ laboratorio: lab._id, data: amanha, motivo: 'Aula prática', ...dados });

describe('POST /api/agendamentos', () => {
  it('cria um agendamento válido', async () => {
    const res = await agendar(tokenMaria, { horaInicio: 10, horaFim: 12 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ status: 'confirmado', horaInicio: 10, horaFim: 12 });
    expect(res.body.laboratorio.nome).toBe('Lab Info');
  });

  it('recusa horário que se sobrepõe a outro (409)', async () => {
    await agendar(tokenMaria, { horaInicio: 10, horaFim: 12 });
    const res = await agendar(tokenJoao, { horaInicio: 11, horaFim: 13 });

    expect(res.status).toBe(409);
  });

  it('permite horários "encostados" (10-12 e 12-13)', async () => {
    await agendar(tokenMaria, { horaInicio: 10, horaFim: 12 });
    const res = await agendar(tokenJoao, { horaInicio: 12, horaFim: 13 });

    expect(res.status).toBe(201);
  });

  it('libera o horário depois do cancelamento', async () => {
    const { body } = await agendar(tokenMaria, { horaInicio: 10, horaFim: 12 });
    await request(app)
      .patch(`/api/agendamentos/${body._id}/cancelar`)
      .set('Authorization', `Bearer ${tokenMaria}`);

    const res = await agendar(tokenJoao, { horaInicio: 10, horaFim: 12 });
    expect(res.status).toBe(201);
  });

  it('recusa horário fora do funcionamento do laboratório (400)', async () => {
    const res = await agendar(tokenMaria, { horaInicio: 6, horaFim: 9 });
    expect(res.status).toBe(400);
  });

  it('recusa data no passado (400)', async () => {
    const res = await agendar(tokenMaria, { data: '2020-01-10', horaInicio: 10, horaFim: 11 });
    expect(res.status).toBe(400);
  });

  it('recusa fim antes do início (400)', async () => {
    const res = await agendar(tokenMaria, { horaInicio: 14, horaFim: 12 });
    expect(res.status).toBe(400);
  });
});

describe('Permissões nos agendamentos', () => {
  it('usuário comum só vê os próprios agendamentos; admin vê todos', async () => {
    await agendar(tokenMaria, { horaInicio: 8, horaFim: 9 });
    await agendar(tokenJoao, { horaInicio: 9, horaFim: 10 });

    const daMaria = await request(app).get('/api/agendamentos').set('Authorization', `Bearer ${tokenMaria}`);
    const doAdmin = await request(app).get('/api/agendamentos').set('Authorization', `Bearer ${tokenAdmin}`);

    expect(daMaria.body).toHaveLength(1);
    expect(doAdmin.body).toHaveLength(2);
  });

  it('um usuário não pode cancelar o agendamento de outro (403)', async () => {
    const { body } = await agendar(tokenMaria, { horaInicio: 10, horaFim: 11 });
    const res = await request(app)
      .patch(`/api/agendamentos/${body._id}/cancelar`)
      .set('Authorization', `Bearer ${tokenJoao}`);

    expect(res.status).toBe(403);
  });

  it('somente admin pode excluir definitivamente', async () => {
    const { body } = await agendar(tokenMaria, { horaInicio: 10, horaFim: 11 });

    const comoDono = await request(app)
      .delete(`/api/agendamentos/${body._id}`)
      .set('Authorization', `Bearer ${tokenMaria}`);
    const comoAdmin = await request(app)
      .delete(`/api/agendamentos/${body._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(comoDono.status).toBe(403);
    expect(comoAdmin.status).toBe(204);
  });
});

describe('GET /api/agendamentos/disponibilidade', () => {
  it('lista os horários ocupados e marca os do próprio usuário', async () => {
    await agendar(tokenMaria, { horaInicio: 10, horaFim: 12 });
    await agendar(tokenJoao, { horaInicio: 14, horaFim: 15 });

    const res = await request(app)
      .get('/api/agendamentos/disponibilidade')
      .query({ laboratorio: String(lab._id), data: amanha })
      .set('Authorization', `Bearer ${tokenMaria}`);

    expect(res.status).toBe(200);
    expect(res.body.laboratorio).toMatchObject({ horaAbertura: 8, horaFechamento: 18 });
    expect(res.body.ocupados).toEqual([
      expect.objectContaining({ horaInicio: 10, horaFim: 12, meu: true }),
      expect.objectContaining({ horaInicio: 14, horaFim: 15, meu: false }),
    ]);
  });
});
