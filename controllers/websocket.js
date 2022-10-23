var connections = [];

const handleConnection = (ws) => {
  ws.on("message", (message) => {
    var dataString = message.toString();
    if (dataString == "Hello") {
      console.log(dataString);
      ws.send("Hi from Node.js");
    } else {
      console.log(dataString);
      ws.send("Are you not saying hi to me 🥺👉👈");
    }
  });
  console.log("connection");
  ws.onclose = function (event) {
    connections.pop(ws);
    console.log("disconnected");
  };
  connections.push(ws);
  console.log("connection");
};

const sendToAll = (message) => {
  connections.forEach((conn) => {
    conn.send(message);
  });
};

//export controller functions
module.exports = {
  connections,
  handleConnection,
  sendToAll,
};
