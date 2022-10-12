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

const run = async function () {
  await dropAll();

  var func1 = await createFuncionario({
    nome: "Func #1",
    cpf: "1234",
    email: "func1@gmail.com",
    telefone: "111111111",
    nascimento: "11-11-1911",
    genero: "M",
    senha: "1234",
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
    senha: "1234",
  });

  var quarto1 = await createQuarto({
    nome: "Quarto top",
    numero: "25a",
    macAddressEsp: "84-68-26-C6-5A-54",
    maxOcupantes: 5,
    precoBase: 500,
    ocupado: false,
  });

  var quarto2 = await createQuarto({
    nome: "Quarto nao tao top",
    numero: "25b",
    macAddressEsp: "F9-2E-99-E4-E1-02",
    maxOcupantes: 2,
    precoBase: 150,
    ocupado: false,
  });

  var card1 = await createCartaoChave("12 34 56 78");
  var card2 = await createCartaoChave("87 65 43 21");

  t1 = await pushCartaoChaveToFunc(func1._id, card1);
  t2 = await pushCartaoChaveToFunc(func2._id, card2);

  // console.log(t1, t2);

  var fs2b = await addFuncionarioServico(func2._id, servicoB._id);
  console.log("\n>> fs2b:\n", fs2b);

  funcionario = await getFuncionarioWithPopulate(func1._id);
  console.log("\n>> populated func1:\n", funcionario);

  servico = await getServicoWithPopulate(servicoB._id);
  console.log("\n>> populated servicoB:\n", servico);
};

const dropCollection = function (collection) {
  return new Promise((resolve) => {
    mongoose.connection.collections[collection].drop({}, () => {
      console.log(`Dropped collection ${collection} successfully!`);
      resolve(collection);
    });
  });
};

const dropAll = async function () {
  const collections = Object.keys(mongoose.connection.collections);

  for (var i = 0; i < collections.length; i++) {
    await dropCollection(collections[i]);
  }
};

module.exports = { run, dropAll };
