# LabAgenda UFRR

Sistema Full Stack de agendamento de laboratórios da UFRR — Projeto Final de Arquitetura Web.

**Dupla:** Vinicius Martins (2023001156) e Jasmim Sabini (2023010360)

> **Versão 2 — Autenticação, níveis de acesso e agendamentos.** A API está completa; o frontend vem na v3.

## Estrutura

```
server/
  src/
    config/        conexão com o MongoDB
    models/        Usuario, Laboratorio, Agendamento (Mongoose)
    controllers/   auth, usuario, laboratorio, agendamento, dashboard
    routes/        mapeamento URL + verbo HTTP -> middlewares -> controller
    middlewares/   auth (JWT + papéis), validate (Joi), 404 e erros
    validators/    schemas Joi de entrada + mensagens em português
    utils/         AppError, asyncHandler, gerarToken, datas
    seed.js        cria admin, usuário comum e laboratórios de exemplo
    app.js         configuração do Express
    server.js      ponto de entrada
```

## Como rodar

Pré-requisitos: Node.js 18+ e um MongoDB (local ou [MongoDB Atlas](https://www.mongodb.com/atlas)).

```bash
cd server
npm install
cp .env.example .env   # ajuste MONGO_URI e JWT_SECRET
npm run seed           # cria admin@ufrr.br / admin123 e usuario@ufrr.br / usuario123
npm run dev
```

### Variáveis de ambiente (`server/.env`)

| Variável         | Exemplo                                | Descrição                              |
|------------------|----------------------------------------|----------------------------------------|
| `PORT`           | `3333`                                 | Porta da API                           |
| `MONGO_URI`      | `mongodb://127.0.0.1:27017/labagenda`  | Conexão com o Mongo                    |
| `JWT_SECRET`     | `um-segredo-longo`                     | Chave para assinar os tokens           |
| `JWT_EXPIRES_IN` | `8h`                                   | Validade do token                      |
| `ADMIN_EMAIL`    | `admin@ufrr.br`                        | Admin criado pelo seed                 |
| `ADMIN_SENHA`    | `admin123`                             | Senha do admin criado pelo seed        |

## Segurança

- **Hash de senha:** bcrypt (biblioteca `bcryptjs`, implementação em JavaScript puro do mesmo algoritmo, que não precisa de compilação nativa), aplicado no `pre('save')` do model. A senha tem `select: false` e nunca é devolvida em JSON.
- **AuthN:** login devolve um token JWT; as rotas protegidas exigem `Authorization: Bearer <token>`.
- **AuthZ:** dois papéis, `admin` e `usuario`, verificados pelo middleware `autorizar('admin')` e por regras de dono do recurso nos controllers.
- **Validação:** toda entrada passa por um schema Joi com `stripUnknown` (campos extras são descartados, ex.: um `papel: "admin"` enviado no cadastro é ignorado), além das validações do Mongoose.

## Endpoints

🔓 público · 🔑 logado · 👑 admin

| Método | Rota                                   |     | Descrição                                          |
|--------|----------------------------------------|-----|----------------------------------------------------|
| POST   | `/api/auth/registro`                   | 🔓  | Cadastro (sempre como `usuario`)                   |
| POST   | `/api/auth/login`                      | 🔓  | Login → `{ usuario, token }`                       |
| GET    | `/api/auth/me`                         | 🔑  | Dados do usuário logado                            |
| GET    | `/api/laboratorios`                    | 🔑  | Lista (filtros `busca`, `bloco`, `ativo`)          |
| GET    | `/api/laboratorios/:id`                | 🔑  | Detalhe                                            |
| POST   | `/api/laboratorios`                    | 👑  | Cria                                               |
| PUT    | `/api/laboratorios/:id`                | 👑  | Atualiza                                           |
| DELETE | `/api/laboratorios/:id`                | 👑  | Remove (e os agendamentos dele)                    |
| GET    | `/api/agendamentos`                    | 🔑  | Admin: todos; usuário: os seus. Filtros `laboratorio`, `usuario`, `data`, `status`, `periodo` |
| GET    | `/api/agendamentos/disponibilidade`    | 🔑  | `?laboratorio=&data=` → horários ocupados do dia   |
| GET    | `/api/agendamentos/:id`                | 🔑  | Detalhe (dono ou admin)                            |
| POST   | `/api/agendamentos`                    | 🔑  | Cria (verifica conflito, expediente e data passada)|
| PUT    | `/api/agendamentos/:id`                | 🔑  | Altera (dono ou admin)                             |
| PATCH  | `/api/agendamentos/:id/cancelar`       | 🔑  | Cancela (dono ou admin)                            |
| DELETE | `/api/agendamentos/:id`                | 👑  | Exclui definitivamente                             |
| GET    | `/api/usuarios`                        | 👑  | Lista usuários                                     |
| POST   | `/api/usuarios`                        | 👑  | Cria usuário com papel definido                    |
| GET    | `/api/usuarios/:id`                    | 🔑  | Detalhe (próprio ou admin)                         |
| PUT    | `/api/usuarios/:id`                    | 🔑  | Edita (próprio ou admin; só admin muda o papel)    |
| DELETE | `/api/usuarios/:id`                    | 👑  | Remove (e os agendamentos dele)                    |
| GET    | `/api/dashboard`                       | 👑  | Totais, próximos 7 dias e laboratórios mais usados |

Exemplos prontos em `server/requests.http`.
