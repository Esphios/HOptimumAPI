const mongoose = require("mongoose");
const db = require("../models");
const { getPeopleESP, createLogQuarto: logQuarto, getReservaWithPopulate: getReserva } = require("../scripts/utilsDB.js");
const { sendToClient } = require("./websocket.js");

const isValid = (string) => string != null && string.length > 0;

//POST '/api/auth'
const authenticate = async (req, res) => {
    const mac = req.body.mac;
    const cartao = req.body.cartao;

    if (!isValid(mac) || !isValid(cartao))
        return res.status(400).send({ error: "Missing information" });


    var quarto = await db.Quarto.findOne({ macAddressEsp: mac }, '-registros');
    if (quarto == null)
        return res.status(404).send({ error: "Mac address não encontrado no cadastro." });

    var card = await db.CartaoChave.findOne({ codigo: cartao });
    if (card == null)
        return res.status(404).send({ error: "Cartão não encontrado." });

    var p = await getPeopleESP({ quarto: quarto, cartoesChave: card });

    switch (p.type) {

        case "hospede":
            var log = await logQuarto({ cartao: card, reserva: p.data, quarto: quarto });
            await db.Quarto.updateOne({ _id: quarto._id }, { $push: { registros: log } });
            var conexoes = p.data.hospedes.reduce((acc, cur) => acc.concat(cur.hospede.conexoes), []);
            conexoes.forEach((c) => sendToClient(c, JSON.stringify(log)));
            return res.status(200).json({ reserva: p.data });

        case "funcionario":
            var log = await logQuarto({ cartao: card, funcionario: p.data, quarto: quarto });
            await db.Quarto.updateOne({ _id: quarto._id }, { $push: { registros: log } });
            await db.Funcionario.updateOne({ _id: p.data._id }, { $push: { registros: log } });

            var reserva = await getReserva({ quarto: quarto, checkIn: { $lte: Date.now() }, checkOut: { $gte: Date.now() } })
            if (reserva != null) {
                var conn = reserva.hospedes.reduce((acc, cur) => acc.concat(cur.hospede.conexoes), []);
                conn.forEach((c) => sendToClient(c, JSON.stringify(log)));
            }
            p.data.conexoes.forEach((c) => sendToClient(c, JSON.stringify(log)));
            return res.status(200).json({ funcionario: p.data });

        default:
            return res
                .status(404)
                .send({ error: "Pessoa não encontrada, confira as credenciais" });
    }
};

//export controller functions
module.exports = {
    authenticate,
};
