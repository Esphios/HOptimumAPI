const express = require("express");
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

const server = express()
  .use(express.json())
  .use("/public", express.static(process.cwd() + "/public")) //make public static
  .use("/", routes)
  .listen(process.env.PORT || 3000, () => {
    console.log(`Listening on ${server.address().port}`)
    connectMongo()
      .then(runMandatoryStartupTasks)
      .then(() => {
        startupState.markPhase("ready");
        startupState.setReady(true);
      })
      .catch((error) => {
        startupState.setLastError(error);
        console.error("Startup failure:", error);
      });
  }
  );

wsListener(new Server({ server }))
