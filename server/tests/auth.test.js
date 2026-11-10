const request = require('supertest');
const banco = require('./banco');
const app = require('../src/app');
const Usuario = require('../src/models/Usuario');

beforeAll(banco.conectar);
afterEach(banco.limpar);
afterAll(banco.desconectar);

const novoUsuario = { nome: 'Maria Souza', email: 'maria@ufrr.br', senha: '123456' };

describe('POST /api/auth/registro', () => {
  it('cria o usuário como "usuario" e devolve token, sem a senha', async () => {
    const res = await request(app).post('/api/auth/registro').send(novoUsuario);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario).toMatchObject({ nome: 'Maria Souza', email: 'maria@ufrr.br', papel: 'usuario' });
    expect(res.body.usuario.senha).toBeUndefined();
  });

  it('guarda a senha com hash bcrypt', async () => {
    await request(app).post('/api/auth/registro').send(novoUsuario);
    const salvo = await Usuario.findOne({ email: 'maria@ufrr.br' }).select('+senha');

    expect(salvo.senha).not.toBe('123456');
    expect(salvo.senha).toMatch(/^\$2[aby]\$/);
  });

  it('ignora "papel: admin" enviado pelo cliente', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ ...novoUsuario, papel: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.usuario.papel).toBe('usuario');
  });

  it('recusa e-mail repetido com 409', async () => {
    await request(app).post('/api/auth/registro').send(novoUsuario);
    const res = await request(app).post('/api/auth/registro').send(novoUsuario);

    expect(res.status).toBe(409);
  });

  it('valida os dados de entrada com 400 e detalhes por campo', async () => {
    const res = await request(app).post('/api/auth/registro').send({ nome: 'A', email: 'invalido', senha: '1' });

    expect(res.status).toBe(400);
    expect(res.body.detalhes.map((d) => d.campo).sort()).toEqual(['email', 'nome', 'senha']);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => Usuario.create(novoUsuario));

  it('faz login com credenciais corretas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'maria@ufrr.br', senha: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('responde 401 com senha incorreta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'maria@ufrr.br', senha: 'errada' });

    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe('E-mail ou senha incorretos');
  });

  it('responde 401 com a mesma mensagem para e-mail inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ninguem@ufrr.br', senha: '123456' });

    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe('E-mail ou senha incorretos');
  });
});

describe('Proteção de rotas', () => {
  it('bloqueia rota protegida sem token (401)', async () => {
    const res = await request(app).get('/api/laboratorios');
    expect(res.status).toBe(401);
  });

  it('bloqueia token inválido (401)', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer token-falso');
    expect(res.status).toBe(401);
  });

  it('bloqueia usuário comum em rota de admin (403)', async () => {
    const { body } = await request(app).post('/api/auth/registro').send(novoUsuario);
    const res = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${body.token}`);

    expect(res.status).toBe(403);
  });
});
