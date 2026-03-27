# AGENTS.md

## Visão Geral

Este repositório contém uma API Node.js para um sistema integrado de hotelaria.
O backend usa Express, MongoDB com Mongoose e WebSocket sobre o mesmo servidor
HTTP.

## Tecnologias Principais

| Categoria | Tecnologia | Evidência | Uso |
| --- | --- | --- | --- |
| Runtime | Node.js CommonJS | `server.js`, `package.json` | Aplicação principal |
| API | Express 4 | `server.js`, `routes/api.js` | Rotas HTTP |
| Banco | MongoDB + Mongoose 6 | `package.json`, `server.js`, `models/` | Persistência |
| Tempo real | `ws` | `server.js`, `controllers/websocket.js` | WebSocket |
| Configuração | `dotenv` | `server.js`, `.env.example` | Variáveis de ambiente |
| Desenvolvimento | `nodemon` | `package.json` | Reinício automático local |

## Estrutura do Repositório

- `server.js`: bootstrap do Express, MongoDB, assets estáticos e WebSocket.
- `routes/api.js`: rotas HTTP e wrapper de segurança.
- `controllers/api.js`: ações REST.
- `controllers/websocket.js`: comportamento do socket.
- `controllers/esp.js`: integração específica com dispositivos externos.
- `models/`: modelos Mongoose de hóspedes, reservas, quartos, carros, serviços e logs.
- `scripts/utilsDB.js`: utilitários de acesso e manipulação do banco.
- `scripts/testDatabase.js`: rotinas de carga/reset usadas no bootstrap local.
- `public/`: assets servidos em `/public`.

## Setup e Ambiente

- Variáveis importantes em `.env.example`: `PORT`, `MONGODB_URI`, `TZ`.
- Há placeholders para `USERNAME` e `PASSWORD`, mas a conexão observada usa `MONGODB_URI`.
- O servidor escuta em `process.env.PORT || 3000`.
- O bootstrap chama `resetAllConnections()` ao subir o servidor; revise esse efeito colateral antes de mexer em startup.

## Comandos de Desenvolvimento

```bash
npm install
npm start
npm test
```

`npm test` atualmente sobe `nodemon server.js`; não existe suíte de testes automatizados no repositório.

## Convenções e Limites

- Preserve a separação `routes -> controllers -> models/scripts`.
- Novas rotas devem continuar usando o wrapper `secure(...)` quando seguirem o padrão atual.
- Evite colocar acesso direto ao Mongoose em `routes/api.js`.
- Mudanças de schema em `models/` exigem revisão dos controllers e utilitários associados.
- Não commite `.env` nem hardcode credenciais ou URIs do MongoDB.

## Peculiaridades do Projeto

- O bootstrap mistura inicialização HTTP, reset de conexões de teste e conexão com o MongoDB no mesmo arquivo.
- WebSocket e REST compartilham o mesmo servidor e ciclo de vida.
- O histórico de commits é misto em pt-BR e inglês, sem convenção estável.
