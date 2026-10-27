# LabAgenda UFRR

Sistema Full Stack de agendamento de laboratórios da UFRR — Projeto Final de Arquitetura Web.

**Dupla:** Vinicius Martins (2023001156) e Jasmim Sabini (2023010360)

> **Versão 1 — Backend base.** Nesta etapa existe apenas a API com o CRUD de laboratórios.

## Estrutura

```
server/
  src/
    config/        conexão com o MongoDB
    models/        schemas do Mongoose (Model)
    controllers/   regras de cada recurso (Controller)
    routes/        mapeamento URL + verbo HTTP -> controller
    middlewares/   404 e tratamento central de erros
    utils/         AppError e asyncHandler
    app.js         configuração do Express
    server.js      ponto de entrada (conecta no banco e sobe o servidor)
```

A "View" do MVC é a resposta em JSON.

## Como rodar

Pré-requisitos: Node.js 18+ e um MongoDB (local ou [MongoDB Atlas](https://www.mongodb.com/atlas)).

```bash
cd server
npm install
cp .env.example .env   # ajuste a MONGO_URI se precisar
npm run dev            # ou npm start
```

### Variáveis de ambiente (`server/.env`)

| Variável    | Exemplo                                    | Descrição            |
|-------------|--------------------------------------------|----------------------|
| `PORT`      | `3333`                                     | Porta da API         |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/labagenda`      | Conexão com o Mongo  |

## Endpoints

| Método | Rota                     | Descrição                                   |
|--------|--------------------------|---------------------------------------------|
| GET    | `/api/health`            | Verifica se a API está no ar                |
| GET    | `/api/laboratorios`      | Lista (filtros: `busca`, `bloco`, `ativo`)  |
| GET    | `/api/laboratorios/:id`  | Detalha um laboratório                      |
| POST   | `/api/laboratorios`      | Cria                                        |
| PUT    | `/api/laboratorios/:id`  | Atualiza                                    |
| DELETE | `/api/laboratorios/:id`  | Remove                                      |

Exemplos prontos em `server/requests.http`.
