const { v4: uuidv4 } = require("uuid");
const { getPeople } = require("../scripts/utilsDB.js");
const db = require("../models");
const { isAllowedWsOrigin } = require("../scripts/security");

let wss = null;

const getSocketById = (id) => {
  if (wss?.clients == null) {
    return null;
  }

  for (const socket of wss.clients) {
    if (socket.id === id) {
      return socket;
    }
  }

  return null;
};

const authenticateClientConnection = (id, auth) => {
  const socket = getSocketById(id);
  if (socket == null) {
    return false;
  }

  socket.auth = auth;
  return true;
};

const handleConnection = (ws, request) => {
  const origin = request.headers.origin;
  if (!isAllowedWsOrigin(origin)) {
    ws.close(1008, "Origin not allowed");
    return;
  }

  ws.id = uuidv4();
  ws.auth = null;
  ws.send(JSON.stringify({ loginId: ws.id }));
  console.log("connection: ", ws.id);

  ws.on("message", () => {});
  ws.on("close", async () => {
    console.log("disconnected");
    const data = { conexoes: ws.id };

    const person = await getPeople(data);
    switch (person.type) {
      case "hospede":
        await db.Hospede.updateOne({ _id: person.data._id }, { $pull: data });
        return;
      case "funcionario":
        await db.Funcionario.updateOne({ _id: person.data._id }, { $pull: data });
        return;
      default:
        return;
    }
  });
};

const wsListener = (_wss) => {
  wss = _wss;
  wss.on("connection", handleConnection);
};

const sendToClient = (id, message) => {
  const socket = getSocketById(id);
  if (socket?.auth != null) {
    socket.send(message);
    return true;
  }

  return false;
};

const sendToAll = (message) => {
  if (wss?.clients == null) {
    return;
  }

  wss.clients.forEach((client) => {
    if (client.auth != null) {
      client.send(message);
    }
  });
};

module.exports = {
  authenticateClientConnection,
  wsListener,
  sendToClient,
  sendToAll,
};
