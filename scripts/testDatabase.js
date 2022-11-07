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

  var cargo3 = await createCargo({
    nome: "cozinha",
    salarioBase: 1750,
  });

  return [cargo1, cargo2, cargo3];
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
    senha: "22222",
  });

  var dependente1 = await createHospede({
    nome: "Dependente #1",
    cpf: "6165",
    email: "dependente1@gmail.com",
    telefone: "4546546546",
    nascimento: "12-01-1991",
    genero: "F",
    senha: "00000",
  });

  var dependente2 = await createHospede({
    nome: "Dependente #2",
    cpf: "7987",
    email: "dependente2@gmail.com",
    telefone: "46546546",
    nascimento: "12-02-1982",
    genero: "M",
    senha: "00000",
  });

  return [pessoa1, pessoa2, dependente1, dependente2];
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
    cor: "preto",
    modelo: "fuscão",
    placa: "FPE2324",
  });

  var carro2 = await createCarro({
    cor: "verde",
    modelo: "gol bolinha",
    placa: "BRA2E19",
  });

  var carro3 = await createCarro({
    cor: "prata",
    modelo: "tesla S",
    placa: "BRA2E55",
  });

  return [carro1, carro2, carro3];
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

  var func3 = await createFuncionario({
    nome: "Func #3",
    cpf: "5678",
    email: "func3@gmail.com",
    telefone: "33333333333",
    nascimento: "03-03-1933",
    senha: "1234",
    cargo: cargos[2]
  });

  return [func1, func2, func3];
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
    macAddressEsp: "EC:62:60:83:ED:54",
    maxOcupantes: 2,
    precoBase: 150,
    ocupado: false,
  });

  var quarto3 = await createQuarto({
    nome: "Quarto lixo",
    numero: "1a",
    macAddressEsp: "0C:B8:15:D8:7C:EC",
    maxOcupantes: 1,
    precoBase: 50,
    ocupado: false,
  });

  return [quarto1, quarto2, quarto3];
};

const addCartoes = async function () {
  var card1 = await createCartaoChave(" 3B 9C B6 1C");
  var card2 = await createCartaoChave(" DA 5B BE 15");
  var card3 = await createCartaoChave(" BA 66 67 15");
  var card4 = await createCartaoChave(" 4B DF AC 1C");
  var card5 = await createCartaoChave(" 0B 51 94 1C");
  var card6 = await createCartaoChave(" 0A 85 7F 15");

  return [card1, card2, card3, card4, card5, card6];
};

const run = async function () {
  await dropAll();
  var quartos = await addQuartos();
  var cards = await addCartoes();

  var func = await addFuncionarios();
  var serv = await addServicos();

  var hospedes = await addHospedes();
  var reservas = await addReservas([quartos[0], quartos[1]]);

  var fs00 = await addFuncionarioServico(func[0]._id, serv[0]._id);
  // console.log("\n>> fs1a:\n", fs00);
  var fs01 = await addFuncionarioServico(func[0]._id, serv[1]._id);
  // console.log("\n>> fs1b:\n", fs01);
  var fs11 = await addFuncionarioServico(func[1]._id, serv[1]._id);
  // console.log("\n>> fs2b:\n", fs11);


  var hr00 = await addHospedeReserva(hospedes[0]._id, reservas[0]._id);
  // console.log("\n>> hr00:\n", hr00);
  var hr11 = await addHospedeReserva(hospedes[1]._id, reservas[1]._id);
  // console.log("\n>> hr11:\n", hr11);
  var hr20 = await addHospedeReserva(hospedes[2]._id, reservas[0]._id, titular=false);
  // console.log("\n>> hr20:\n", hr20);
  var hr30 = await addHospedeReserva(hospedes[3]._id, reservas[0]._id, titular=false);
  // console.log("\n>> hr30:\n", hr30);

  t1 = await pushCartaoChaveToFunc(func[0]._id, cards[0]);
  t2 = await pushCartaoChaveToReserva(reservas[0]._id, cards[1]);
  t3 = await pushCartaoChaveToReserva(reservas[0]._id, cards[2]);
  t4 = await pushCartaoChaveToReserva(reservas[0]._id, cards[3]);
  t5 = await pushCartaoChaveToFunc(func[1]._id, cards[4]);
  t6 = await pushCartaoChaveToReserva(reservas[1]._id, cards[6]);

  var carros = await addCarros();

  c1 = await pushCarroToFunc(func[0]._id, carros[0]);
  c1 = await pushCarroToFunc(func[1]._id, carros[1]);
  c2 = await pushCarroToHospede(hospedes[0]._id, carros[2]);


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
