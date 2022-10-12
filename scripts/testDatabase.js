const mongoose = require("mongoose");

const {
  createFuncionario,
  createServico,
  addFuncionarioServico,
  getFuncionarioWithPopulate,
  getServicoWithPopulate,
  createQuarto,
  createCartaoChave,
  pushCartaoChaveToFunc,
  dropCollection
} = require("./utilsDB");

const addFuncionarios = async function () {
  var func1 = await createFuncionario({
    nome: "Func #1",
    cpf: "1234",
    email: "func1@gmail.com",
    telefone: "111111111",
    nascimento: "11-11-1911",
    genero: "M",
    senha: "1234",
  });

  var func2 = await createFuncionario({
    nome: "Func #2",
    cpf: "4321",
    email: "func2@gmail.com",
    telefone: "222222222",
    nascimento: "12-22-1922",
    senha: "1234",
  });

  return [func1, func2];
};

const addServicos = async function () {
  var servicoA = await createServico({
    nome: "servicoA",
  });
  var servicoB = await createServico({
    nome: "servicoB",
  });

  return [servicoA, servicoB];
};

const addQuartos = async function () {
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

  return [quarto1, quarto2];
};

const addCartoes = async function () {
  var card1 = await createCartaoChave("12 34 56 78");
  var card2 = await createCartaoChave("87 65 43 21");

  return [card1, card2];
};

const run = async function () {
  await dropAll();

  var func = await addFuncionarios();
  var serv = await addServicos();

  var fs00 = await addFuncionarioServico(func[0]._id, serv[0]._id);
  console.log("\n>> fs1a:\n", fs00);
  var fs01 = await addFuncionarioServico(func[0]._id, serv[1]._id);
  console.log("\n>> fs1b:\n", fs01);

  var quarto = await addQuartos();

  var card = await addCartoes();

  t1 = await pushCartaoChaveToFunc(func[0]._id, card[0]);
  t2 = await pushCartaoChaveToFunc(func[1]._id, card[1]);

  var fs11 = await addFuncionarioServico(func[1]._id, serv[1]._id);
  console.log("\n>> fs2b:\n", fs11);

  funcionario = await getFuncionarioWithPopulate(func[0]._id);
  console.log("\n>> populated func1:\n", funcionario);

  servico = await getServicoWithPopulate(serv[1]._id);
  console.log("\n>> populated servicoB:\n", servico);
};

const dropAll = async function () {
  const collections = Object.keys(mongoose.connection.collections);

  for (var i = 0; i < collections.length; i++) {
    await dropCollection(collections[i]);
  }
};

module.exports = { run, dropAll };
