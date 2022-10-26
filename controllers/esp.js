const mongoose = require("mongoose");
const db = require("../models");
const { createLogQuarto } = require("../scripts/utilsDB");
const { sendToAll } = require("./websocket.js");

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

    var ok = null;
    var log = null;
    ok = await db.Funcionario.findOne({ cartoesChave: card }).select('nome');

    if (ok == null) {
        ok = await db.Reserva.findOne({ cartoesChave: card, quarto: quarto }).select('hospedes');
        if (ok == null)
            return res.status(401).send({ error: "Acesso negado." });
        log = await createLogQuarto({ cartao: card, reserva: ok });
    } else {
        log = await createLogQuarto({ cartao: card, funcionario: ok });
    }

    await db.Quarto.updateOne({ _id: quarto._id }, { $push: { registros: log } });
    // return res.status(200).send(log);

    sendToAll(JSON.stringify(log));
    console.log(log);
    return res.status(200).send(log);
};

//export controller functions
module.exports = {
    authenticate,
};
