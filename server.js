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
  onMongoConnected,
  onMongoDisconnected,
  onMongoError,
} = require("./scripts/bootstrap");
const startupState = require("./scripts/startupState");
require("dotenv").config();

validateConfig();
startupState.markPhase("bootstrapping");

const app = express()
  .use(express.json())
  .get("/health/liveness", (req, res) => {
    res.status(200).json({
      status: "alive",
      state: startupState.cloneState(),
    });
  })
  .get("/health/readiness", (req, res) => {
    const state = startupState.cloneState();
    res.status(state.ready ? 200 : 503).json({
      status: state.ready ? "ready" : "not_ready",
      state,
    });
  })
  .use("/public", express.static(process.cwd() + "/public")) //make public static
  .use((req, res, next) => {
    if (startupState.cloneState().ready) {
      return next();
    }

    return res.status(503).json({
      error: "Service unavailable",
      details: "Application is still bootstrapping dependencies",
    });
  })
  .use("/", routes);

const server = http.createServer(app);
let shuttingDown = false;
let websocketServer = null;

const listen = () =>
  new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(process.env.PORT || 3000, () => {
      server.off("error", reject);
      console.log(`Listening on ${server.address().port}`);
      resolve();
    });
  });

const closeWebsocketServer = () =>
  new Promise((resolve) => {
    if (!websocketServer) {
      resolve();
      return;
    }

    websocketServer.close(() => resolve());
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
    await closeWebsocketServer();
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
    if (!websocketServer) {
      websocketServer = new Server({ server });
      wsListener(websocketServer);
    }
    startupState.markPhase("ready");
    startupState.setReady(true);
  } catch (error) {
    startupState.setLastError(error);
    startupState.markPhase("failed");
    await shutdown("Startup failure", error);
  }
};

onMongoConnected(() => {
  startupState.setMongoConnected(true);

  const { phase } = startupState.cloneState();
  if (!shuttingDown && (phase === "ready" || phase === "degraded")) {
    startupState.markPhase("ready");
    startupState.setReady(true);
  }
});

onMongoDisconnected(() => {
  startupState.setMongoConnected(false);

  if (!shuttingDown) {
    startupState.markPhase("degraded");
    startupState.setReady(false);
  }
});

onMongoError((error) => {
  startupState.setLastError(error);
});

process.on("SIGINT", () => shutdown("Received SIGINT"));
process.on("SIGTERM", () => shutdown("Received SIGTERM"));
process.on("unhandledRejection", (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  shutdown("Unhandled promise rejection", error);
});
process.on("uncaughtException", (error) => {
  shutdown("Uncaught exception", error);
});

listen()
  .then(bootstrap)
  .catch((error) => shutdown("Failed to bind HTTP server", error));
