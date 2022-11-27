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
  addReservaServico,
  addHospedeReserva,
  getFuncionarioWithPopulate,
  getServicoWithPopulate,
  pushCarroToHospede,
  pushCarroToFunc,
  pushCartaoChaveToReserva,
  pushCartaoChaveToFunc,
  dropCollection,
  resetHospedeConnections,
  resetFuncionarioConnections,
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
  reserva1 = await createReserva({
    checkIn: new Date("2022-11-08T08:00:00.000-03:00"),
    checkOut: new Date("2022-12-08T18:00:00.000-03:00"),
    quarto: quartos[0],
  });

  reserva2 = await createReserva({
    checkIn: new Date("2022-11-08T08:00:00.000-03:00"),
    checkOut: new Date("2023-01-28T18:00:00.000-03:00"),
    quarto: quartos[1],
  });

  return [reserva1, reserva2]
};

const addCarros = async function () {
  var carro1 = await createCarro({
    cor: "preto",
    modelo: "fuscão",
    placa: "AXW6652",
  });

  var carro2 = await createCarro({
    cor: "verde",
    modelo: "gol bolinha",
    placa: "HQW5678",
  });

  var carro3 = await createCarro({
    cor: "prata",
    modelo: "tesla S",
    placa: "BRA2E19",
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
  const servicos = [
    {
      nome: "Serviço de quarto",
      tipo: "Serviço de quarto",
      imageUrl:
        "https://cdn.sanity.io/images/tbvc1g2x/production/e48f7be484d6838b1812cbebcbbcf068b8581bfc-1600x1067.jpg?w=1600&h=1067&auto=format",
      espera: 30,
      preco: 15.00,
    },
    {
      nome: "Iogurte com cereais e frutas",
      tipo: "Café da Manhã",
      imageUrl:
        "https://images.unsplash.com/photo-1581559178851-b99664da71ba?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=386&q=80",
      espera: 20,
      preco: 10.00,
    },
    {
      nome: "Torrada e ovo frito",
      tipo: "Café da Manhã",
      imageUrl:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=580&q=80",
      espera: 25,
      preco: 12.00,
    },
    {
      nome: "Carne assada com vegetais",
      tipo: "Almoço",
      imageUrl:
        "https://images.unsplash.com/photo-1573225342350-16731dd9bf3d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=762&q=80",
      espera: 60,
      preco: 30.00,
    },
    {
      nome: "Pizza de quatro quejos",
      tipo: "Jantar",
      imageUrl:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
      espera: 60,
      preco: 40.00,
    },
    {
      nome: "Spaghetti com Molho de Tomate",
      tipo: "Almoço",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg/800px-Spaghetti_Bolognese_mit_Parmesan_oder_Grana_Padano.jpg",
      espera: 40,
      preco: 35.00,
    },
    {
      nome: "Hamburguer clássico",
      tipo: "Jantar",
      imageUrl:
        "https://cdn.pixabay.com/photo/2014/10/23/18/05/burger-500054_1280.jpg",
      espera: 45,
      preco: 15.00,
    },
    {
      nome: "Mousse de Laranja",
      tipo: "Almoço",
      imageUrl:
        "https://cdn.pixabay.com/photo/2017/05/01/05/18/pastry-2274750_1280.jpg",
      espera: 40,
      preco: 15.00,
    },
    {
      nome: "Suflê de Chocolate",
      tipo: "Jantar",
      imageUrl:
        "https://cdn.pixabay.com/photo/2014/08/07/21/07/souffle-412785_1280.jpg",
      espera: 30,
      preco: 15.00,
    }];

  return await Promise.all(servicos.map(async (s) => {
    return await createServico(s);
  }));
};

const addQuartos = async function () {
  var quarto1 = await createQuarto({
    nome: "Quarto Família",
    numero: "2a",
    macAddressEsp: "58:BF:25:33:3B:DC",
    maxOcupantes: 5,
    precoBase: 300,
    ocupado: true,
    imageUrl: "https://cdn.pixabay.com/photo/2017/01/14/12/48/hotel-1979406_960_720.jpg"
  });

  var quarto2 = await createQuarto({
    nome: "Quarto Casal",
    numero: "2b",
    macAddressEsp: "EC:62:60:83:ED:54",
    maxOcupantes: 2,
    precoBase: 150,
    ocupado: true,
    imageUrl: "https://cdn.pixabay.com/photo/2016/09/18/03/28/travel-1677347_960_720.jpg"
  });

  var quarto3 = await createQuarto({
    nome: "Quarto Solteiro",
    numero: "1a",
    macAddressEsp: "0C:B8:15:D8:7C:EC",
    maxOcupantes: 1,
    precoBase: 50,
    ocupado: false,
    imageUrl: "https://cdn.pixabay.com/photo/2016/04/15/11/43/hotel-1330834_960_720.jpg"
  });

  return [quarto1, quarto2, quarto3];
};

const addCartoes = async function () {
  var card1 = await createCartaoChave(" 3B 9C B6 1C");
  var card2 = await createCartaoChave(" DA 5B BE 15");
  var card3 = await createCartaoChave(" BA 66 67 15");
  var card4 = await createCartaoChave(" 4B DF AC 1C");
  var card5 = await createCartaoChave(" 0A 85 7F 15");
  var card6 = await createCartaoChave(" 0B 51 94 1C");
  return [card1, card2, card3, card4, card5, card6];
};

const run = async function () {
  await dropAll();
  var quartos = await addQuartos();
  var cards = await addCartoes();

  var func = await addFuncionarios();
  var servicos = await addServicos();

  var hospedes = await addHospedes();
  var reservas = await addReservas([quartos[0], quartos[1]]);

  // var fs00 = await addFuncionarioServico(func[0]._id, serv[0]._id);
  // // console.log("\n>> fs1a:\n", fs00);
  // var fs01 = await addFuncionarioServico(func[0]._id, serv[1]._id);
  // // console.log("\n>> fs1b:\n", fs01);
  // var fs11 = await addFuncionarioServico(func[1]._id, serv[1]._id);
  // // console.log("\n>> fs2b:\n", fs11);

  var rs1 = await addReservaServico(reservas[0]._id, servicos[0]._id, func[1])
  var rs2 = await addReservaServico(reservas[0]._id, servicos[2]._id, func[2])
  var rs3 = await addReservaServico(reservas[0]._id, servicos[1]._id, func[2])
  var rs4 = await addReservaServico(reservas[0]._id, servicos[2]._id, func[2])
  var rs5 = await addReservaServico(reservas[1]._id, servicos[3]._id, func[2])

  var hr00 = await addHospedeReserva(hospedes[0]._id, reservas[0]._id);
  // console.log("\n>> hr00:\n", hr00);
  var hr11 = await addHospedeReserva(hospedes[1]._id, reservas[1]._id);
  // console.log("\n>> hr11:\n", hr11);
  var hr20 = await addHospedeReserva(hospedes[2]._id, reservas[0]._id, titular = false);
  // console.log("\n>> hr20:\n", hr20);
  var hr30 = await addHospedeReserva(hospedes[3]._id, reservas[0]._id, titular = false);
  // console.log("\n>> hr30:\n", hr30);

  t1 = await pushCartaoChaveToFunc(func[0]._id, cards[0]);
  t2 = await pushCartaoChaveToReserva(reservas[0]._id, cards[1]);
  t3 = await pushCartaoChaveToReserva(reservas[0]._id, cards[2]);
  t4 = await pushCartaoChaveToReserva(reservas[0]._id, cards[3]);
  t5 = await pushCartaoChaveToFunc(func[1]._id, cards[4]);
  t6 = await pushCartaoChaveToReserva(reservas[1]._id, cards[5]);

  var carros = await addCarros();

  c1 = await pushCarroToFunc(func[0]._id, carros[0]);
  c2 = await pushCarroToFunc(func[1]._id, carros[1]);
  c3 = await pushCarroToHospede(hospedes[0]._id, carros[2]);


  funcionario = await getFuncionarioWithPopulate({ _id: func[0]._id });
  console.log("\n>> populated func1:\n", funcionario);

  // servico = await getServicoWithPopulate(serv[1]._id);
  // console.log("\n>> populated servicoB:\n", servico);
};

const dropAll = async function () {
  const collections = Object.keys(mongoose.connection.collections);

  for (var i = 0; i < collections.length; i++) {
    await dropCollection(collections[i]);
  }
};

const resetAllConnections = async function () {
  await resetHospedeConnections({});
  await resetFuncionarioConnections({});
};


module.exports = { run, resetAllConnections, dropAll };
