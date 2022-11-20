// const path = require('path');
const {
  getPeople,
  createHospede,
  createFuncionario,
  createCarro,
  addReservaServico,
  createLogCarro: logCarro,
  pushCarroToFunc,
  pushCarroToHospede,
  getReservaWithPopulate: getReserva,
  getServicoWithPopulate: getServico,
} = require("../scripts/utilsDB.js");
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

  var log = await logCarro({ status: status, carro: carro });
  await db.Carro.updateOne({ _id: carro._id }, { $push: { registros: log } });

  if (p.data.conexoes != null && p.data.conexoes.length > 0)
    p.data.conexoes.forEach((id) => sendToClient(id, (JSON.stringify(log))));

  return res.status(200).send(log);
};



//POST '/api/statusservico'
const statusServico = async (req, res) => {
  const id = req.body.id;
  const status = req.body.status;

  if (!isValid(id) || !isValid(status))
    return res.status(400).send({ error: "Missing information" });

  var rs = await db.ReservaServico.findByIdAndUpdate(id, { status: status }, { new: true });
  if (rs == null) return res.status(404).send({ error: "Serviço não encontrado" });
  []
  var reserva = await getReserva({ _id: rs.reservaId });
  if (reserva != null) {
    var conn = reserva.hospedes.reduce((acc, cur) => acc.concat(cur.hospede.conexoes), []);
    conn.forEach((c) => sendToClient(c, JSON.stringify(rs)));
  }

  return res.status(200).send(rs);
};

//POST '/api/cadastro'
const cadastro = async (req, res) => {
  const tipo = req.body.tipo;
  let dados = {};

  switch (tipo) {
    case 'funcionario':
      dados.cpf = req.body.cpf
      dados.nome = req.body.nome
      dados.email = req.body.email
      dados.nascimento = req.body.nascimento
      dados.senha = req.body.senha
      dados.cargo = req.body.cargo

      if (!Object.values(dados).every(isValid)) return res.status(400).send({ error: "Informações faltando, cheque os dados novamente" })

      dados.cargo = await db.Cargo.findOne({ nome: dados.cargo })
      if (dados.cargo == null) return res.status(404).send({ error: "Cargo não encontrado" })

      // dados.carros = req.body.carros
      dados.genero = req.body.genero
      dados.telefone = req.body.telefone

      let func = await createFuncionario(dados);

      let cars = req.body.carros;

      let carArray = await Promise.all(cars.map(async (id) => {
        let carro = await db.Carro.findById(id)
        if (carro == null) return null;
        return await pushCarroToFunc(func._id, carro);
      }));

      return res.status(200).send(func)

    case 'hospede':
      dados.cpf = req.body.cpf
      dados.nome = req.body.nome
      dados.email = req.body.email
      dados.nascimento = req.body.nascimento
      dados.senha = req.body.senha

      if (!Object.values(dados).every(isValid)) return res.status(400).send({ error: "Informações faltando, cheque os dados novamente" })

      // let carro = await db.Carro.findOne({ placa: req.body.carro });

      dados.genero = req.body.genero
      dados.telefone = req.body.telefone

      let hospede = await createHospede(dados);

      let carros = req.body.carros;

      await Promise.all(carros.map(async (c) => {
        let carro = await db.Carro.findOne({placa: c})
        if (carro == null) return null;
        return await pushCarroToHospede(hospede._id, carro);
      }));

      return res.status(200).send(hospede);

    default:
      return res.status(400).send({ error: "Tipo de cadastro não especificado" })
  }
};

//GET '/api/servicos'
const servicos = async (req, res) => {
  return res.status(200).send(await db.Servico.find({}))
};

//POST '/api/addcarro'
const addCarro = async (req, res) => {
  let carro = {
    cor: req.body.cor,
    modelo: req.body.modelo,
    placa: req.body.placa,
  };

  if (!Object.values(carro).every(isValid)) return res.status(400).send({ error: "Informações faltando, cheque os dados novamente" })

  let test = await db.Carro.findOne({ placa: carro.placa })
  if (test != null) return res.status(400).send({ error: "Placa já existe no sistema" })

  let c = await createCarro(carro);
  return res.status(200).send(c);
};

//POST '/api/getcarro'
const getCarro = async (req, res) => {
  let carro = {
    cor: req.body.cor,
    modelo: req.body.modelo,
    placa: req.body.placa,
  };

  let c = await db.Carro.findOne(carro)
  if (c == null) return res.status(404).send({ error: "Carro não encontrado" })

  return res.status(200).send(c);
};

function random_item(items) {
  return items[Math.floor(Math.random() * items.length)];
}

//POST '/api/addservico'
const addServico = async (req, res) => {
  const idServico = req.body.idServico;
  const idReserva = req.body.idReserva;

  if (!isValid(idServico) || !isValid(idReserva))
    return res.status(400).send({ error: "Missing information" });

  let s = await getServico({_id: idServico});
  let r = await getReserva({_id: idReserva});

  if (s == null || r == null)
    return res.status(404).send({ error: "Um ou mais itens não foram encontrados." });

  let c = null;
  if (s.tipo == "Serviço de quarto") {
    c = await db.Cargo.find({nome: "limpeza"})
  } else {
    c = await db.Cargo.find({nome: "cozinha"})
  }
  let funcs = await db.Funcionario.find({cargo: c});
  let doc = await addReservaServico(idReserva, idServico, random_item(funcs));

  return res.status(200).send(doc);
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
  cadastro,
  servicos,
  statusServico,
  getAllObj,
  newObj,
  deleteAllObj,
  getOneObj,
  newComment,
  deleteOneObj,
  addCarro,
  getCarro,
  addServico,
  authenticate: require("./esp").authenticate,
};
