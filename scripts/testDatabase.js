const mongoose = require("mongoose");

const {
  createCargo,
  createFuncionario,
  createServico,
  createHospede,
  createReserva,
  createCarro,
  // createLogCarro,
  createQuarto,
  // createLogQuarto,
  createCartaoChave,
  addFuncionarioServico,
  addHospedeReserva,
  getFuncionarioWithPopulate,
  getServicoWithPopulate,
  pushCarroToHospede,
  pushCarroToFunc,
  pushCartaoChaveToReserva,
  pushCartaoChaveToFunc,
  dropCollection,
} = require("./utilsDB");

const addCargos = async function () {
  var cargo1 = await createCargo({
    nome: "segurança",
    salarioBase: 2000,
  });

  var cargo2 = await createCargo({
    nome: "limpeza",
    salarioBase: 1500,
  });

  return [cargo1, cargo2];
};

const addHospedes = async function () {
  var pessoa1 = await createHospede({
    nome: "Pessoa #1",
    cpf: "5678",
    email: "pessoa1@gmail.com",
    telefone: "123123123",
    nascimento: "01-01-1901",
    genero: "F",
    senha: "11111",
  });

  var pessoa2 = await createHospede({
    nome: "Pessoa #2",
    cpf: "8765",
    email: "pessoa2@gmail.com",
    telefone: "3213213312",
    nascimento: "02-02-1902",
    genero: "M",
    senha: "222222",
  });

  return [pessoa1, pessoa2];
};

const addReservas = async function (quartos) {
  return await Promise.all(quartos.map(async (quarto) => {
    return await createReserva({
      quarto: quarto,
    });
  }));
};

const addCarros = async function () {
  var carro1 = await createCarro({
    cor: "azul",
    modelo: "renault fiesta",
    placa: "FPE2324",
  });

  var carro2 = await createCarro({
    cor: "verde",
    modelo: "gol bolinha",
    placa: "BRA2E19",
  });

  return [carro1, carro2];
};

const addFuncionarios = async function () {
  var cargos = await addCargos();
  var func1 = await createFuncionario({
    nome: "Func #1",
    cpf: "1234",
    email: "func1@gmail.com",
    telefone: "111111111",
    nascimento: "11-11-1911",
    genero: "M",
    senha: "1234",
    cargo: cargos[0]
  });

  var func2 = await createFuncionario({
    nome: "Func #2",
    cpf: "4321",
    email: "func2@gmail.com",
    telefone: "222222222",
    nascimento: "12-22-1922",
    senha: "1234",
    cargo: cargos[1]
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
    macAddressEsp: "58:BF:25:33:3B:DC",
    maxOcupantes: 5,
    precoBase: 500,
    ocupado: false,
  });

  var quarto2 = await createQuarto({
    nome: "Quarto nao tao top",
    numero: "25b",
    macAddressEsp: "24:D1:34:6A:7D:F0",
    maxOcupantes: 2,
    precoBase: 150,
    ocupado: false,
  });

  return [quarto1, quarto2];
};

const addCartoes = async function () {
  var card1 = await createCartaoChave(" 3B 9C B6 1C");
  var card2 = await createCartaoChave(" 87 65 43 21");

  return [card1, card2];
};

const run = async function () {
  await dropAll();
  var quartos = await addQuartos();
  var cards = await addCartoes();

  var func = await addFuncionarios();
  var serv = await addServicos();

  var hospedes = await addHospedes();
  var reservas = await addReservas(quartos);

  var fs00 = await addFuncionarioServico(func[0]._id, serv[0]._id);
  console.log("\n>> fs1a:\n", fs00);
  var fs01 = await addFuncionarioServico(func[0]._id, serv[1]._id);
  console.log("\n>> fs1b:\n", fs01);
  var fs11 = await addFuncionarioServico(func[1]._id, serv[1]._id);
  console.log("\n>> fs2b:\n", fs11);


  var hr00 = await addHospedeReserva(hospedes[0]._id, reservas[0]._id);
  console.log("\n>> hr00:\n", hr00);
  var hr11 = await addHospedeReserva(hospedes[1]._id, reservas[1]._id);
  console.log("\n>> hr11:\n", hr11);

  t1 = await pushCartaoChaveToFunc(func[0]._id, cards[0]);
  t2 = await pushCartaoChaveToReserva(reservas[0]._id, cards[1]);

  var carros = await addCarros();

  t3 = await pushCarroToFunc(func[0]._id, carros[0]);
  t4 = await pushCarroToHospede(hospedes[0]._id, carros[1]);


  funcionario = await getFuncionarioWithPopulate({ _id: func[0]._id });
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
