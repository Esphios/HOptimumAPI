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
  return db.Funcionario.findById(id).populate({
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

async function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

const run = async function () {
  console.log("Creating in 3, 2, 1...")
  await sleep(200);

  var func1 = await createFuncionario({
    nome: "Func #1",
    cpf: "1234",
    email: "func1@gmail.com",
    telefone: "111111111",
    nascimento: "11-11-1911",
    genero: "M"
  });
  var servicoA = await createServico({
    nome: "servicoA",
  });
  var servicoB = await createServico({
    nome: "servicoB",
  });

  var fs1a = await addFuncionarioServico(func1._id, servicoA._id);
  console.log("\n>> fs1a:\n", fs1a);
  var fs1b = await addFuncionarioServico(func1._id, servicoB._id);
  console.log("\n>> fs1b:\n", fs1b);

  var func2 = await createFuncionario({
    nome: "Func #2",
    cpf: "4321",
    email: "func2@gmail.com",
    telefone: "222222222",
    nascimento: "12-22-1922",
  });

  var fs2b = await addFuncionarioServico(func2._id, servicoB._id);
  console.log("\n>> fs2b:\n", fs2b);

  funcionario = await getFuncionarioWithPopulate(func1._id);
  console.log("\n>> populated func1:\n", funcionario);

  servico = await getServicoWithPopulate(servicoB._id);
  console.log("\n>> populated servicoB:\n", servico);
};

const dropAll = async function () {
  const collections = await mongoose.connection.collections;

  // Create an array of collection names and drop each collection
  Object.keys(collections).forEach(async (collectionName) => {
    collections[collectionName].drop();
    console.log(`Dropped collection ${collectionName} successfully!`);
  });
};

module.exports = { run, dropAll };
