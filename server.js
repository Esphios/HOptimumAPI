const express = require("express");
const http = require("http");
const { Server } = require("ws");
const { wsListener } = require("./controllers/websocket.js");
const routes = require("./routes/api");
const {
  connectMongo,
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

const listen = () =>
  new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(process.env.PORT || 3000, () => {
      server.off("error", reject);
      console.log(`Listening on ${server.address().port}`);
      resolve();
    });
  });

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
    console.error("Startup failure:", error);
    process.exit(1);
  }
};

bootstrap();
