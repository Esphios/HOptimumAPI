const express = require("express");
const { Server } = require("ws");
const { wsListener } = require("./controllers/websocket.js");
const routes = require("./routes/api");
const script = require("./scripts/testDatabase");
require("dotenv").config();

//establish connection to database
const mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGODB_URI,
  {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
  function (err) {
    if (err) return console.log("Error: ", err);
    console.log(
      "MongoDB Connection -- Ready state is:",
      mongoose.connection.readyState
    );
    // script.run();
  }
);

const server = express()
  .use(express.json())
  .use("/public", express.static(process.cwd() + "/public")) //make public static
  .use("/", routes)
  .listen(process.env.PORT || 3000, () =>
    console.log(`Listening on ${server.address().port}`)
  );

wsListener(new Server({ server }))
