const mongoose = require("mongoose");
const db = require("../models");
const { getPeopleESP, createLogQuarto: logQuarto } = require("../scripts/utilsDB.js");
const { sendToClient } = require("./websocket.js");

const isValid = (string) => string != null && string.length > 0;

//POST '/api/auth'
const authenticate = async (req, res) => {
    const mac = req.body.mac;
    const cartao = req.body.cartao;

    if (!isValid(mac) || !isValid(cartao))
        return res.status(400).send({ error: "Missing information" });


    var quarto = await db.Quarto.findOne({ macAddressEsp: mac });
    if (quarto == null)
        return res.status(404).send({ error: "Mac address não encontrado no cadastro." });

    var card = await db.CartaoChave.findOne({ codigo: cartao });
    if (card == null)
        return res.status(404).send({ error: "Cartão não encontrado." });

    var p = await getPeopleESP({ quarto: quarto, cartoesChave: card });

    const getConexoesFromReserva = (reserva) => {
        var conexoes = [];
        reserva.hospedes.forEach( (h) => {
            conexoes.push(...h.hospede.conexoes );
        })
        return conexoes;
    }

    switch (p.type) {

        case "hospede":
            var log = await logQuarto({ cartao: card, reserva: p.data });
            await db.Quarto.updateOne({ _id: quarto._id }, { $push: { registros: log } });
            const conexoes = getConexoesFromReserva(p.data)
            conexoes.forEach((c) => sendToClient(c, JSON.stringify(log)));
            return res.status(200).json({ reserva: p.data });

        case "funcionario":
            var log = await logQuarto({ cartao: card, funcionario: p.data });
            await db.Quarto.updateOne({ _id: quarto._id }, { $push: { registros: log } });
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
