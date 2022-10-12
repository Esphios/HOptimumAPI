const mongoose = require("mongoose");
const db = require("../models");

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

const getFuncionarioWithPopulate = function (id) {
  return db.Funcionario.findById(id)
    .populate("cartoesChave")
    .populate({
      path: "servicos",
      populate: {
        path: "servico",
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

const pushCartaoChaveToFunc = function (funcId, cartao) {
  return db.Funcionario.updateOne(
    { _id: funcId },
    { $push: { cartoesChave: cartao } }
  );
};

const pullCartaoChaveToFunc = function (funcId, cartao) {
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
    createFuncionario,
    createServico,
    addFuncionarioServico,
    getFuncionarioWithPopulate,
    getServicoWithPopulate,
    createQuarto,
    createCartaoChave,
    pushCartaoChaveToFunc,
    pullCartaoChaveToFunc,
    dropCollection
};