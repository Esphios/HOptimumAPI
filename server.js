const express = require("express");
const http = require("http");
const { Server } = require("ws");
const { wsListener } = require("./controllers/websocket.js");
const routes = require("./routes/api");
const {
  connectMongo,
  disconnectMongo,
  runMandatoryStartupTasks,
  validateConfig,
} = require("./scripts/bootstrap");
const startupState = require("./scripts/startupState");
require("dotenv").config();

validateConfig();
startupState.markPhase("bootstrapping");

const app = express()
  .use(express.json())
  .use("/public", express.static(process.cwd() + "/public")) //make public static
  .use("/", routes);

const server = http.createServer(app);
const websocketServer = new Server({ server });
let shuttingDown = false;

const listen = () =>
  new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(process.env.PORT || 3000, () => {
      server.off("error", reject);
      console.log(`Listening on ${server.address().port}`);
      resolve();
    });
  });

const closeServer = () =>
  new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const shutdown = async (reason, error) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  startupState.markPhase("shutting_down");
  startupState.setReady(false);

  if (error) {
    startupState.setLastError(error);
    console.error(`${reason}:`, error);
  } else {
    console.log(reason);
  }

  try {
    await closeServer();
    await disconnectMongo();
  } finally {
    process.exit(error ? 1 : 0);
  }
};

const bootstrap = async () => {
  try {
    await connectMongo();
    await runMandatoryStartupTasks();
    await listen();
    wsListener(websocketServer);
    startupState.markPhase("ready");
    startupState.setReady(true);
  } catch (error) {
    startupState.setLastError(error);
    startupState.markPhase("failed");
    await shutdown("Startup failure", error);
  }
};

process.on("SIGINT", () => shutdown("Received SIGINT"));
process.on("SIGTERM", () => shutdown("Received SIGTERM"));
process.on("unhandledRejection", (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  shutdown("Unhandled promise rejection", error);
});
process.on("uncaughtException", (error) => {
  shutdown("Uncaught exception", error);
});

bootstrap();
