# HOptimumAPI
Aplicacao de sistemas integrados para redes de hotelaria.

Esta e a API desenvolvida em Node.js com MongoDB para o HOptimum, uma aplicacao usada como trabalho de conclusao de curso em Engenharia da Computacao em 2022.

## Como usar

```bash
npm install
copy .env.example .env
npm run lint
npm start
```

## Requisitos de ambiente

O projeto depende de um MongoDB acessivel no momento da inicializacao.

Variaveis de ambiente esperadas:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hoptimum
AUTH_TOKEN_SECRET=replace-with-a-long-random-secret
ESP_SHARED_SECRET=replace-with-a-device-shared-secret
```

## Contrato de startup

- O processo sobe a porta HTTP antes do bootstrap completo apenas para expor health checks.
- A aplicacao so fica pronta para trafego funcional depois de conectar no MongoDB.
- `resetAllConnections()` so roda quando `ALLOW_DESTRUCTIVE_STARTUP_TASKS=true`.
- Enquanto o bootstrap nao terminar, rotas fora de health retornam `503 Service unavailable`.
- Se a conexao inicial com o MongoDB falhar por erro transitorio, o processo aplica retry controlado antes de encerrar.

## Variaveis de ambiente

- `PORT`: porta HTTP do servico.
- `MONGODB_URI`: string de conexao do MongoDB. Obrigatoria.
- `MONGODB_CONNECT_MAX_ATTEMPTS`: quantidade maxima de tentativas de conexao inicial.
- `MONGODB_CONNECT_RETRY_DELAY_MS`: intervalo entre tentativas de conexao inicial.
- `AUTH_TOKEN_SECRET`: segredo usado para assinar tokens de autenticacao. Obrigatoria.
- `AUTH_TOKEN_TTL_MS`: TTL dos tokens de autenticacao em milissegundos.
- `ESP_SHARED_SECRET`: segredo compartilhado exigido no header `x-esp-secret` para `/api/auth`.
- `ALLOW_DESTRUCTIVE_STARTUP_TASKS`: habilita tarefas destrutivas de bootstrap apenas quando explicitamente `true`.
- `ALLOWED_WS_ORIGINS`: lista separada por virgula de origins permitidas para WebSocket.
- `TZ`: timezone do processo.

## Health checks

- `GET /health/liveness`: indica que o processo esta vivo.
- `GET /health/readiness`: indica se MongoDB e tarefas obrigatorias de bootstrap estao estaveis.
