const mongoose = require("mongoose");
const {
  addHospedeReserva,
  addReservaServico,
  createCarro,
  createFuncionario,
  createHospede,
  createLogCarro: logCarro,
  createReserva,
  getCredentialRecordByEmail,
  getFuncionarioWithPopulate: getFuncionario,
  getHospedeWithPopulate: getHospede,
  getPeople,
  getReservaWithPopulate: getReserva,
  getServicoWithPopulate: getServico,
  pushCarroToFunc,
  pushCarroToHospede,
} = require("../scripts/utilsDB.js");
const db = require("../models");
const { sendToClient } = require("./websocket.js");
const {
  hashPassword,
  isPasswordHash,
  issueAuthToken,
  sanitizeResponseDocument,
  verifyPassword,
} = require("../scripts/security");

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;
const isOptionalString = (value) => value == null || isNonEmptyString(value);
const isValidDateValue = (value) =>
  isNonEmptyString(value) && !Number.isNaN(new Date(value).getTime());
const isValidObjectId = (value) =>
  isNonEmptyString(value) && mongoose.Types.ObjectId.isValid(value);
const isOptionalObjectIdArray = (value) =>
  value == null ||
  (Array.isArray(value) && value.every((entry) => isValidObjectId(entry)));
const sanitizeUserPayload = (payload) => sanitizeResponseDocument(payload);
const reservationBelongsToHospede = (reserva, hospedeId) =>
  Array.isArray(reserva?.hospedes) &&
  reserva.hospedes.some(
    (entry) => String(entry?.hospede?._id || entry?.hospede) === String(hospedeId)
  );
const randomItem = (items) =>
  Array.isArray(items) && items.length > 0
    ? items[Math.floor(Math.random() * items.length)]
    : null;

const login = async (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;
  const id = req.body.id;

  if (!isNonEmptyString(email) || !isNonEmptyString(senha) || !isNonEmptyString(id)) {
    return res.status(400).send({ error: "InformaÃ§Ãµes faltando" });
  }

  const credentialRecord = await getCredentialRecordByEmail(email);
  if (credentialRecord.type == null || credentialRecord.data == null) {
    return res
      .status(404)
      .send({ error: "Pessoa nÃ£o encontrada, confira as credenciais" });
  }

  const passwordMatches = await verifyPassword(senha, credentialRecord.data.senha);
  if (!passwordMatches) {
    return res
      .status(404)
      .send({ error: "Pessoa nÃ£o encontrada, confira as credenciais" });
  }

  if (!isPasswordHash(credentialRecord.data.senha)) {
    const senhaHash = await hashPassword(senha);
    const collection =
      credentialRecord.type === "funcionario" ? db.Funcionario : db.Hospede;

    await collection.updateOne(
      { _id: credentialRecord.data._id },
      { $set: { senha: senhaHash } }
    );
  }

  const user =
    credentialRecord.type === "funcionario"
      ? await getFuncionario({ _id: credentialRecord.data._id })
      : await getHospede({ _id: credentialRecord.data._id });

  if (credentialRecord.type === "hospede") {
    if (!user.conexoes.includes(id)) {
      await db.Hospede.updateOne({ _id: user._id }, { $push: { conexoes: id } });
    }
  } else {
    await db.Funcionario.updateOne({ _id: user._id }, { $push: { conexoes: id } });

    if (user?.cargo?.nome === "seguranÃ§a") {
      const plainUser = JSON.parse(JSON.stringify(user));
      plainUser.relatos = await db.Relato.find({}).populate({
        path: "hospede",
        select: "-senha",
        populate: {
          path: "reservas",
          populate: {
            path: "reserva",
            populate: {
              path: "quarto",
            },
          },
        },
      });

      const token = issueAuthToken({
        userId: credentialRecord.data._id,
        userType: credentialRecord.type,
        roleName: credentialRecord.data?.cargo?.nome || null,
      });

      console.log("logged in: ", email, id);
      return res.status(200).send({ token, funcionario: sanitizeUserPayload(plainUser) });
    }
  }

  const token = issueAuthToken({
    userId: credentialRecord.data._id,
    userType: credentialRecord.type,
    roleName: credentialRecord.data?.cargo?.nome || null,
  });

  console.log("logged in: ", email, id);
  return credentialRecord.type === "funcionario"
    ? res.status(200).send({ token, funcionario: sanitizeUserPayload(user) })
    : res.status(200).json({ token, hospede: sanitizeUserPayload(user) });
};

const garagem = async (req, res) => {
  const placa = req.body.placa;
  const status = req.body.status;

  if (!isNonEmptyString(placa) || !isNonEmptyString(status)) {
    return res.status(400).send({ error: "InformaÃ§Ãµes faltando" });
  }

  const carro = await db.Carro.findOne({ placa });
  if (carro == null) {
    return res.status(404).send({ error: "carro nÃ£o cadastrado" });
  }

  const person = await getPeople({ carros: carro });
  if (person == null || person.data == null) {
    return res.status(404).send({ error: "dono do carro nÃ£o encontrado" });
  }

  const log = await logCarro({ status, carro });
  await db.Carro.updateOne({ _id: carro._id }, { $push: { registros: log } });

  if (Array.isArray(person.data.conexoes) && person.data.conexoes.length > 0) {
    person.data.conexoes.forEach((connectionId) =>
      sendToClient(connectionId, JSON.stringify(log))
    );
  }

  return res.status(200).send(log);
};

const statusServico = async (req, res) => {
  const id = req.body.id;
  const status = req.body.status;

  if (!isValidObjectId(id) || !isNonEmptyString(status)) {
    return res.status(400).send({ error: "InformaÃ§Ãµes faltando" });
  }

  const rs = await db.ReservaServico.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (rs == null) {
    return res.status(404).send({ error: "ServiÃ§o nÃ£o encontrado" });
  }

  const reserva = await getReserva({ _id: rs.reservaId });
  if (reserva != null) {
    const connections = reserva.hospedes.reduce(
      (acc, cur) => acc.concat(cur.hospede.conexoes),
      []
    );
    connections.forEach((connectionId) =>
      sendToClient(connectionId, JSON.stringify(rs))
    );
  }

  return res.status(200).send(rs);
};

const cadastro = async (req, res) => {
  const tipo = req.body.tipo;
  const carros = req.body.carros;

  if (!Array.isArray(carros) && carros != null) {
    return res.status(400).send({ error: "Lista de carros invÃ¡lida" });
  }

  switch (tipo) {
    case "funcionario": {
      const dados = {
        cpf: req.body.cpf,
        nome: req.body.nome,
        email: req.body.email,
        nascimento: req.body.nascimento,
        senha: req.body.senha,
        cargo: req.body.cargo,
        genero: req.body.genero,
        telefone: req.body.telefone,
      };

      if (
        ![
          dados.cpf,
          dados.nome,
          dados.email,
          dados.nascimento,
          dados.senha,
          dados.cargo,
        ].every(isNonEmptyString) ||
        !isValidDateValue(dados.nascimento) ||
        !isOptionalString(dados.genero) ||
        !isOptionalString(dados.telefone)
      ) {
        return res
          .status(400)
          .send({ error: "InformaÃ§Ãµes faltando, cheque os dados novamente" });
      }

      const cargo = await db.Cargo.findOne({ nome: dados.cargo });
      if (cargo == null) {
        return res.status(404).send({ error: "Cargo nÃ£o encontrado" });
      }

      const func = await createFuncionario({
        ...dados,
        cargo,
        senha: await hashPassword(dados.senha),
      });
      const carIds = Array.isArray(carros) ? carros : [];
      if (!isOptionalObjectIdArray(carIds)) {
        return res.status(400).send({ error: "Lista de carros invÃ¡lida" });
      }

      await Promise.all(
        carIds.map(async (carId) => {
          const carro = await db.Carro.findById(carId);
          if (carro == null) {
            return null;
          }

          return pushCarroToFunc(func._id, carro);
        })
      );

      return res.status(200).send(sanitizeUserPayload(func));
    }

    case "hospede": {
      const dados = {
        cpf: req.body.cpf,
        nome: req.body.nome,
        email: req.body.email,
        nascimento: req.body.nascimento,
        senha: req.body.senha,
        genero: req.body.genero,
        telefone: req.body.telefone,
      };

      if (
        ![
          dados.cpf,
          dados.nome,
          dados.email,
          dados.nascimento,
          dados.senha,
        ].every(isNonEmptyString) ||
        !isValidDateValue(dados.nascimento) ||
        !isOptionalString(dados.genero) ||
        !isOptionalString(dados.telefone)
      ) {
        return res
          .status(400)
          .send({ error: "InformaÃ§Ãµes faltando, cheque os dados novamente" });
      }

      const hospede = await createHospede({
        ...dados,
        senha: await hashPassword(dados.senha),
      });
      const carPlates = Array.isArray(carros) ? carros : [];
      if (!carPlates.every((placa) => isNonEmptyString(placa))) {
        return res.status(400).send({ error: "Lista de carros invÃ¡lida" });
      }

      await Promise.all(
        carPlates.map(async (placa) => {
          const carro = await db.Carro.findOne({ placa });
          if (carro == null) {
            return null;
          }

          return pushCarroToHospede(hospede._id, carro);
        })
      );

      return res.status(200).send(sanitizeUserPayload(hospede));
    }

    default:
      return res.status(400).send({ error: "Tipo de cadastro nÃ£o especificado" });
  }
};

const servicos = async (req, res) => res.status(200).send(await db.Servico.find({}));

const addCarro = async (req, res) => {
  const carro = {
    cor: req.body.cor,
    modelo: req.body.modelo,
    placa: req.body.placa,
  };

  if (!Object.values(carro).every(isNonEmptyString)) {
    return res
      .status(400)
      .send({ error: "InformaÃ§Ãµes faltando, cheque os dados novamente" });
  }

  const existingCar = await db.Carro.findOne({ placa: carro.placa });
  if (existingCar != null) {
    return res.status(400).send({ error: "Placa jÃ¡ existe no sistema" });
  }

  return res.status(200).send(await createCarro(carro));
};

const getCarro = async (req, res) => {
  const carro = {
    cor: req.body.cor || req.query.cor,
    modelo: req.body.modelo || req.query.modelo,
    placa: req.body.placa || req.query.placa,
  };

  if (!Object.values(carro).some((value) => isNonEmptyString(value))) {
    return res.status(400).send({ error: "InformaÃ§Ãµes faltando" });
  }

  const foundCar = await db.Carro.findOne(
    Object.fromEntries(
      Object.entries(carro).filter(([, value]) => isNonEmptyString(value))
    )
  );
  if (foundCar == null) {
    return res.status(404).send({ error: "Carro nÃ£o encontrado" });
  }

  return res.status(200).send(foundCar);
};

const addServico = async (req, res) => {
  const idServico = req.body.idServico;
  const idReserva = req.body.idReserva;

  if (!isValidObjectId(idServico) || !isValidObjectId(idReserva)) {
    return res.status(400).send({ error: "InformaÃ§Ãµes faltando" });
  }

  const servico = await getServico(idServico);
  const reserva = await getReserva({ _id: idReserva });
  if (servico == null || reserva == null) {
    return res
      .status(404)
      .send({ error: "Um ou mais itens nÃ£o foram encontrados." });
  }

  if (
    req.auth?.userType === "hospede" &&
    !reservationBelongsToHospede(reserva, req.auth.userId)
  ) {
    return res.status(403).send({ error: "Reserva nÃ£o pertence ao hospede autenticado" });
  }

  const cargoQuery =
    servico.tipo === "ServiÃ§o de quarto"
      ? { nome: "limpeza" }
      : { nome: "cozinha" };
  const cargos = await db.Cargo.find(cargoQuery);
  const funcionarios = await db.Funcionario.find({ cargo: cargos });
  const assignedFuncionario = randomItem(funcionarios);

  if (assignedFuncionario == null) {
    return res.status(409).send({ error: "Nenhum funcionÃ¡rio disponÃ­vel" });
  }

  return res
    .status(200)
    .send(await addReservaServico(idReserva, idServico, assignedFuncionario));
};

const getQuartos = async (req, res) =>
  res.status(200).send(await db.Quarto.find({}));

const resolveReservationInput = async (payload) => {
  if (
    !isValidDateValue(payload.checkIn) ||
    !isValidDateValue(payload.checkOut) ||
    !isValidObjectId(payload.quarto)
  ) {
    return { error: "InformaÃ§Ãµes faltando, cheque os dados novamente" };
  }

  const checkIn = new Date(payload.checkIn);
  const checkOut = new Date(payload.checkOut);
  if (checkIn >= checkOut) {
    return { error: "PerÃ­odo da reserva invÃ¡lido" };
  }

  const quarto = await db.Quarto.findById(payload.quarto);
  if (quarto == null) {
    return { error: "Quarto nÃ£o encontrado", status: 404 };
  }

  return { checkIn, checkOut, quarto };
};

const findReservationConflict = async (reserva) =>
  db.Reserva.findOne({
    status: "ATIVA",
    $or: [
      {
        quarto: reserva.quarto,
        checkIn: { $lte: reserva.checkIn },
        checkOut: { $gte: reserva.checkIn },
      },
      {
        quarto: reserva.quarto,
        checkIn: { $lte: reserva.checkOut },
        checkOut: { $gte: reserva.checkOut },
      },
      {
        quarto: reserva.quarto,
        checkIn: { $gt: reserva.checkIn },
        checkOut: { $lt: reserva.checkOut },
      },
    ],
  });

const checkReserva = async (req, res) => {
  const reserva = await resolveReservationInput(req.body);
  if (reserva.error) {
    return res.status(reserva.status || 400).send({ error: reserva.error });
  }

  const occupies = await findReservationConflict(reserva);
  if (occupies == null) {
    return res.status(200).send(reserva);
  }

  return res.status(406).send({ error: "Reserva invÃ¡lida" });
};

const checkHospede = async (req, res) => {
  if (!isNonEmptyString(req.body.cpf)) {
    return res.status(400).send({ error: "CPF invÃ¡lido" });
  }

  const hospede = await db.Hospede.findOne({ cpf: req.body.cpf }, "nome");
  if (hospede == null) {
    return res.status(404).send({ error: "Pessoa nÃ£o encontrada" });
  }

  return res.status(200).send(hospede);
};

const addReserva = async (req, res) => {
  if (
    !isValidObjectId(req.body.titular) ||
    !isOptionalObjectIdArray(req.body.dependentes)
  ) {
    return res
      .status(400)
      .send({ error: "InformaÃ§Ãµes faltando, cheque os dados novamente" });
  }

  const reserva = await resolveReservationInput(req.body);
  if (reserva.error) {
    return res.status(reserva.status || 400).send({ error: reserva.error });
  }

  const occupies = await findReservationConflict(reserva);
  if (occupies != null) {
    return res.status(406).send({ error: "Reserva invÃ¡lida" });
  }

  const createdReserva = await createReserva(reserva);
  const dependentes = Array.isArray(req.body.dependentes) ? req.body.dependentes : [];

  await Promise.all(
    dependentes.map((dependenteId) =>
      addHospedeReserva(dependenteId, createdReserva._id, false)
    )
  );
  await addHospedeReserva(req.body.titular, createdReserva._id);

  return res.status(200).send(await getReserva({ _id: createdReserva._id }));
};

const listHospedes = async (req, res) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const list = await db.Reserva.find({
    checkIn: { $lte: now },
    checkOut: { $gte: now },
  })
    .populate("cartoesChave")
    .populate("quarto")
    .populate({
      path: "hospedes",
      populate: {
        path: "hospede",
        select: "-senha -reservas",
        populate: {
          path: "carros",
        },
      },
    })
    .populate({
      path: "servicos",
      populate: {
        path: "servico",
      },
    });

  return res.status(200).send(list);
};

const report = async (req, res) => {
  const id = req.body.id;
  const text = req.body.text;

  if (!isValidObjectId(id) || !isNonEmptyString(text)) {
    return res.status(400).send({ error: "InformaÃ§Ãµes faltando" });
  }

  if (String(req.auth?.userId) !== String(id)) {
    return res.status(403).send({ error: "Relato permitido apenas para o hospede autenticado" });
  }

  const hospede = await getHospede({ _id: id });
  if (hospede == null) {
    return res
      .status(404)
      .send({ error: "Pessoa nÃ£o encontrada, confira as credenciais" });
  }

  const relato = await db.Relato.create({ texto: text, hospede });
  await db.Hospede.findByIdAndUpdate(id, { $push: { relatos: relato } });

  const cargos = await db.Cargo.find({ nome: "seguranÃ§a" });
  const funcs = await db.Funcionario.find({ cargo: cargos }, "conexoes");
  const connections = funcs.reduce((acc, cur) => acc.concat(cur.conexoes), []);
  connections.forEach((connectionId) =>
    sendToClient(connectionId, JSON.stringify(relato))
  );

  return res.status(200).send(relato);
};

const updateReserva = async (req, res) => {
  const id = req.body.id;
  let update = req.body.update;

  if (!isValidObjectId(id) || !isNonEmptyString(update)) {
    return res.status(400).send({ error: "InformaÃ§Ãµes faltando" });
  }

  update = update.toUpperCase();
  if (!["ATIVA", "FINALIZADA", "CANCELADA"].includes(update)) {
    return res.status(400).send({ error: "Update invÃ¡lido" });
  }

  try {
    const reserva = await db.Reserva.findByIdAndUpdate(
      id,
      { status: update },
      { new: true }
    );
    return res.status(200).send(reserva);
  } catch (error) {
    return res.status(400).send({ error: "Query negada", data: error });
  }
};

module.exports = {
  updateReserva,
  report,
  listHospedes,
  login,
  garagem,
  cadastro,
  servicos,
  statusServico,
  addReserva,
  checkReserva,
  checkHospede,
  getQuartos,
  addCarro,
  getCarro,
  addServico,
  authenticate: require("./esp").authenticate,
};
