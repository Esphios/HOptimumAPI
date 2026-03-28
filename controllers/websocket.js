const { v4: uuidv4 } = require("uuid");
const { getPeople } = require("../scripts/utilsDB.js");
const db = require("../models");
const { isAllowedWsOrigin, verifyAuthToken } = require("../scripts/security");

let wss = null;

const getTokenFromRequest = (request) => {
  try {
    const url = new URL(request.url, "http://localhost");
    return url.searchParams.get("token");
  } catch {
    return null;
  }
};

const handleConnection = (ws, request) => {
  const origin = request.headers.origin;
  if (!isAllowedWsOrigin(origin)) {
    ws.close(1008, "Origin not allowed");
    return;
  }

  const auth = verifyAuthToken(getTokenFromRequest(request));
  if (!auth) {
    ws.close(1008, "Unauthorized");
    return;
  }

  ws.auth = auth;
  ws.id = uuidv4();
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
  if (wss?.clients != null && wss.clients.size > 0) {
    wss.clients.forEach((socket) => {
      if (socket.id === id) {
        socket.send(message);
      }
    });
    return true;
  }
  return false;
};

const sendToAll = (message) => {
  if (wss?.clients == null) {
    return;
  }

  wss.clients.forEach((client) => {
    client.send(message);
  });
};

module.exports = {
  wsListener,
  sendToClient,
  sendToAll,
};
