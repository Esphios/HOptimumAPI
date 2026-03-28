const db = require("../models");
const {
  createLogQuarto: logQuarto,
  getPeopleESP,
  getReservaWithPopulate: getReserva,
} = require("../scripts/utilsDB.js");
const { sendToClient } = require("./websocket.js");

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const authenticate = async (req, res) => {
  const mac = req.body.mac;
  const cartao = req.body.cartao;

  if (!isNonEmptyString(mac) || !isNonEmptyString(cartao)) {
    return res.status(400).send({ error: "InformaÃ§Ãµes faltando" });
  }

  const quarto = await db.Quarto.findOne({ macAddressEsp: mac }, "-registros");
  if (quarto == null) {
    return res.status(404).send({ error: "Mac address nÃ£o encontrado no cadastro." });
  }

  const card = await db.CartaoChave.findOne({ codigo: cartao });
  if (card == null) {
    return res.status(404).send({ error: "CartÃ£o nÃ£o encontrado." });
  }

  const person = await getPeopleESP({ quarto, cartoesChave: card });

  switch (person.type) {
    case "hospede": {
      const log = await logQuarto({ cartao: card, reserva: person.data, quarto });
      await db.Quarto.updateOne({ _id: quarto._id }, { $push: { registros: log } });

      const connections = person.data.hospedes.reduce(
        (acc, cur) => acc.concat(cur.hospede.conexoes),
        []
      );
      connections.forEach((connectionId) =>
        sendToClient(connectionId, JSON.stringify(log))
      );

      return res.status(200).json({ reserva: person.data });
    }

    case "funcionario": {
      const log = await logQuarto({ cartao: card, funcionario: person.data, quarto });
      await db.Quarto.updateOne({ _id: quarto._id }, { $push: { registros: log } });
      await db.Funcionario.updateOne({ _id: person.data._id }, { $push: { registros: log } });

      const reserva = await getReserva({
        quarto,
        checkIn: { $lte: Date.now() },
        checkOut: { $gte: Date.now() },
      });
      if (reserva != null) {
        const guestConnections = reserva.hospedes.reduce(
          (acc, cur) => acc.concat(cur.hospede.conexoes),
          []
        );
        guestConnections.forEach((connectionId) =>
          sendToClient(connectionId, JSON.stringify(log))
        );
      }

      person.data.conexoes.forEach((connectionId) =>
        sendToClient(connectionId, JSON.stringify(log))
      );
      return res.status(200).json({ funcionario: person.data });
    }

    default:
      return res
        .status(404)
        .send({ error: "Pessoa nÃ£o encontrada, confira as credenciais" });
  }
};

module.exports = {
  authenticate,
};
