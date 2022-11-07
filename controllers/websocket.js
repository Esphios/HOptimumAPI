const { v4: uuidv4 } = require("uuid");
const { getPeople } = require("../scripts/utilsDB.js");
const db = require("../models");

var wss = null;

wsListener = (_wss) => {
  wss = _wss;
  wss.getUniqueID = uuidv4;
  wss.on("connection", handleConnection);
};

const handleConnection = (ws) => {
  ws.id = wss.getUniqueID();
  ws.send(JSON.stringify({ loginId: ws.id }));
  console.log("connection: ", ws.id);

  ws.on("message", (message) => {
    // var dataString = message.toString();
    // if (dataString == "Hello") {
    //   console.log(dataString);
    //   ws.send("Hi from Node.js");
    // } else {
    //   console.log(dataString);
    //   ws.send("Are you not saying hi to me 🥺👉👈");
    // }
  });
  ws.onclose = async function (event) {
    // connections.pop(ws);
    console.log("disconnected");
    data = { conexoes: ws.id };

    var p = await getPeople(data);
    switch (p.type) {
      case 'hospede':
        return await db.Hospede.updateOne({ _id: p.data._id }, { $pull: data });
      case 'funcionario':
        return await db.Funcionario.updateOne({ _id: p.data._id }, { $pull: data });
    }
  };
};

const sendToClient = (id, message) => {
  if (wss.clients != null && wss.clients.size > 0) {
    wss.clients.forEach((socket) => {
      if (socket.id === id) socket.send(message);
    });
    return true;
  }
  return false;
}

const sendToAll = (message) => {
  wss.clients.forEach((client) => {
    client.send(message);
  });
};

//export controller functions
module.exports = {
  wss,
  wsListener,
  sendToClient,
  sendToAll,
};
