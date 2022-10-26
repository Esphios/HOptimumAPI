const mongoose = require("mongoose");
const db = require("../models");

const createCargo = function (cargo) {
  return db.Cargo.create(cargo).then((docCargo) => {
    console.log("\n>> Created Cargo:\n", docCargo);
    return docCargo;
  });
};

const createLogCarro = function (logCarro) {
  return db.LogCarro.create(logCarro).then((docLogCarro) => {
    console.log("\n>> Created LogCarro:\n", docLogCarro);
    return docLogCarro;
  });
};

const createLogQuarto = function (logQuarto) {
  return db.LogQuarto.create(logQuarto).then((docLogQuarto) => {
    console.log("\n>> Created LogQuarto:\n", docLogQuarto);
    return docLogQuarto;
  });
};

const createFuncionario = function (funcionario) {
  return db.Funcionario.create(funcionario).then((docFuncionario) => {
    console.log("\n>> Created Funcionario:\n", docFuncionario);
    return docFuncionario;
  });
};

const createServico = function (servico) {
  return db.Servico.create(servico).then((docServico) => {
    console.log("\n>> Created Servico:\n", docServico);
    return docServico;
  });
};

const createHospede = function (hospede) {
  return db.Hospede.create(hospede).then((docHospede) => {
    console.log("\n>> Created Hospede:\n", docHospede);
    return docHospede;
  });
};

const createReserva = function (reserva) {
  return db.Reserva.create(reserva).then((docReserva) => {
    console.log("\n>> Created Reserva:\n", docReserva);
    return docReserva;
  });
};

const addFuncionarioServico = async function (funcionarioId, servicoId) {
  var doc = await db.FuncionarioServico.create({
    servicoId: servicoId,
    funcionarioId: funcionarioId,
  }).then((doc) => {
    console.log("\n>> Created FuncionarioServico:\n", doc);
    return doc;
  });

  await db.Funcionario.findByIdAndUpdate(funcionarioId, {
    $push: { servicos: doc._id },
  });
  await db.Servico.findByIdAndUpdate(servicoId, {
    $push: { funcionarios: doc._id },
  });

  return doc;
};

const addHospedeReserva = async function (hospedeId, reservaId) {
  var doc = await db.HospedeReserva.create({
    reservaId: reservaId,
    hospedeId: hospedeId,
  }).then((doc) => {
    console.log("\n>> Created HospedeReserva:\n", doc);
    return doc;
  });

  await db.Hospede.findByIdAndUpdate(hospedeId, {
    $push: { reservas: doc._id },
  });
  await db.Reserva.findByIdAndUpdate(reservaId, {
    $push: { hospedes: doc._id },
  });

  return doc;
};

const getFuncionarioWithPopulate = function (func) {
  return db.Funcionario.findOne(func)
    .select("-senha")
    .populate("cartoesChave")
    .populate({
      path: "servicos",
      populate: {
        path: "servico",
      },
    })
    .populate({
      path: "carros",
      populate: {
        path: "registros",
      },
    });
};

const getPeople = async function (data) {
  var func = await getFuncionarioWithPopulate(data);
  if (func == null) {
    var hosp = await getHospedeWithPopulate(data);
    if (hosp == null) return { type: null, data: null };
    return { type: 'hospede', data: hosp };
  }
  return { type: 'funcionario', data: func };;
};

const getHospedeWithPopulate = function (pessoa) {
  return db.Hospede.findOne(pessoa)
    .select("-senha")
    .populate({
      path: "reservas",
      populate: {
        path: "reserva",
      },
    })
    .populate({
      path: "carros",
      populate: {
        path: "registros",
      },
    });
};

const getServicoWithPopulate = function (id) {
  return db.Servico.findById(id).populate({
    path: "funcionarios",
    populate: {
      path: "funcionario",
    },
  });
};

const createCarro = function (carro) {
  return db.Carro.create(carro).then((c) => {
    console.log("\n>> Created Carro:\n", c);
    return c;
  });
};

const createQuarto = function (quarto) {
  return db.Quarto.create(quarto).then((q) => {
    console.log("\n>> Created Quarto:\n", q);
    return q;
  });
};

const createCartaoChave = function (id) {
  return db.CartaoChave.create({ codigo: id }).then((cartao) => {
    console.log("\n>> Created Cartao:\n", cartao);
    return cartao;
  });
};

const pushCarroToHospede = function (hospedeId, carro) {
  return db.Hospede.updateOne({ _id: hospedeId }, { $push: { carros: carro } });
};

const pushCarroToFunc = function (funcId, carro) {
  return db.Hospede.updateOne({ _id: funcId }, { $push: { carros: carro } });
};

const pushCartaoChaveToReserva = function (reservaId, cartao) {
  return db.Reserva.updateOne(
    { _id: reservaId },
    { $push: { cartoesChave: cartao } }
  );
};

const pullCartaoChaveFromReserva = function (reservaId, cartao) {
  return db.Reserva.updateOne(
    { _id: reservaId },
    { $pull: { cartoesChave: cartao } }
  );
};

const pushCartaoChaveToFunc = function (funcId, cartao) {
  return db.Funcionario.updateOne(
    { _id: funcId },
    { $push: { cartoesChave: cartao } }
  );
};

const pullCartaoChaveFromFunc = function (funcId, cartao) {
  return db.Funcionario.updateOne(
    { _id: funcId },
    { $pull: { cartoesChave: cartao } }
  );
};

const dropCollection = function (collection) {
  return new Promise((resolve) => {
    mongoose.connection.collections[collection].drop({}, () => {
      console.log(`Dropped collection ${collection} successfully!`);
      resolve(collection);
    });
  });
};

module.exports = {
  createCargo,
  createFuncionario,
  createServico,
  createHospede,
  createReserva,
  createCarro,
  createLogCarro,
  createQuarto,
  createLogQuarto,
  createCartaoChave,
  addFuncionarioServico,
  addHospedeReserva,
  getPeople,
  getHospedeWithPopulate,
  getFuncionarioWithPopulate,
  getServicoWithPopulate,
  pushCarroToHospede,
  pushCarroToFunc,
  pushCartaoChaveToReserva,
  pullCartaoChaveFromReserva,
  pushCartaoChaveToFunc,
  pullCartaoChaveFromFunc,
  dropCollection,
};
