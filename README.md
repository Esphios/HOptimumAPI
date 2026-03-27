# HOptimumAPI
Aplicação de sistemas integrados para redes de hotelaria

Essa é a API desenvolvida em NodeJS e com banco de dados do MongoDB para o HOptimum, uma aplicação usada como trabalho de conclusão de curso em Engenharia da Computação em 2022.

## Como usar

```bash
npm install
copy .env.example .env
npm start
```

## Contrato de startup

- O processo sobe a porta HTTP antes do bootstrap completo apenas para expor health checks.
- A aplicação só fica pronta para tráfego funcional depois de conectar no MongoDB e executar `resetAllConnections()`.
- Enquanto o bootstrap não terminar, rotas fora de health retornam `503 Service unavailable`.
- Se a conexão inicial com o MongoDB falhar por erro transitório, o processo aplica retry controlado antes de encerrar.

## Variáveis de ambiente

- `PORT`: porta HTTP do serviço.
- `MONGODB_URI`: string de conexão do MongoDB. Obrigatória.
- `MONGODB_CONNECT_MAX_ATTEMPTS`: quantidade máxima de tentativas de conexão inicial.
- `MONGODB_CONNECT_RETRY_DELAY_MS`: intervalo entre tentativas de conexão inicial.
- `TZ`: timezone do processo.

## Health checks

- `GET /health/liveness`: indica que o processo está vivo.
- `GET /health/readiness`: indica se MongoDB e tarefas obrigatórias de bootstrap estão estáveis.
