const mongoose = require("mongoose");
const db = require("../models");
const { sendToAll, connections } = require("./websocket.js");

//POST '/api/authenticate'
const authenticate = async (req, res, next) => {
    const mac = req.body.mac;
    const cartao = req.body.cartao;

    var card = await db.CartaoChave.findOne({ codigo: cartao });
    if (card == null)
        return res.status(404).send({ error: "Cartão não encontrado." });

    var func = await db.Funcionario.findOne({ cartoesChave: card }).select('nome');

    if (func == null) return res.status(404).send({ error: "Cartão válido, porém nenhum usuário está ligado a ele." });

    var now = new Date();
    sendToAll(JSON.stringify({createdAt: now.toUTCString()}));
    console.log(cartao, {createdAt: now.toUTCString()});
    console.log(connections.length);
    return res.send(func);
};

//export controller functions
module.exports = {
    authenticate,
};
