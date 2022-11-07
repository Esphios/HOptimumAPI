// const path = require('path');
const { getPeople, createLogCarro: logCarro } = require("../scripts/utilsDB.js");
const db = require("../models");
const { sendToClient } = require("./websocket.js");

const isValid = (string) => string != null && string.length > 0;
//POST '/api/login'
const login = async (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;
  const id = req.body.id;

  // console.log(req.body);

  if (!isValid(email) || !isValid(senha) || !isValid(id))
    return res.status(400).send({ error: "Missing information" });

  var p = await getPeople({ email: email, senha: senha });

  switch (p.type) {

    case "hospede":
      if (!p.data.conexoes.includes(id)) await db.Hospede.updateOne({ _id: p.data._id }, { $push: { conexoes: id } });
      console.log("logged in: ", email, id);
      return res.status(200).json({ hospede: p.data });

    case "funcionario":
      await db.Funcionario.updateOne({ _id: p.data._id }, { $push: { conexoes: id } });
      console.log("logged in: ", email, id);
      return res.status(200).json({ funcionario: p.data });

    default:
      return res
        .status(404)
        .send({ error: "Pessoa não encontrada, confira as credenciais" });
  }
};

//POST '/api/garagem'
const garagem = async (req, res) => {
  const placa = req.body.placa;
  const status = req.body.status;

  if (!isValid(placa) || !isValid(status))
    return res.status(400).send({ error: "Missing information" });

  var carro = await db.Carro.findOne({ placa: placa });
  if (carro == null) return res.status(404).send({ error: "carro não cadastrado" });

  var p = await getPeople({ carros: carro });
  if (p == null) return res.status(404).send({ error: "dono do carro não encontrado" });

  var log = await logCarro({ status: status });
  await db.Carro.updateOne({ _id: carro._id }, { $push: { registros: log } });

  if (p.data.conexoes != null && p.data.conexoes.length > 0)
    p.data.conexoes.forEach((id) => sendToClient(id, (JSON.stringify(log))));

  return res.status(200).send(log);
};

//GET '/api'
const getAllObj = (req, res, next) => {
  // res.json({message: "GET all api"});
  res.json({ message: "FUNCIONA POHA" });
};

//POST '/api'
const newObj = (req, res, next) => {
  res.json({ message: `Cê mandou isso aqui: ${JSON.stringify(req.body)}` });
};

//DELETE '/api'
const deleteAllObj = (req, res, next) => {
  res.json({ message: "DELETE all api" });
};

//GET '/api/:name'
const getOneObj = (req, res, next) => {
  res.json({ message: "GET 1 api" });
};

//POST '/api/:name'
const newComment = (req, res, next) => {
  res.json({ message: "POST 1 api comment" });
};

//DELETE '/api/:name'
const deleteOneObj = (req, res, next) => {
  res.json({ message: "DELETE 1 api" });
};

//export controller functions
module.exports = {
  login,
  garagem,
  getAllObj,
  newObj,
  deleteAllObj,
  getOneObj,
  newComment,
  deleteOneObj,
  authenticate: require("./esp").authenticate,
};
