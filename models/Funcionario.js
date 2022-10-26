const mongoose = require("mongoose");
const Funcionario = mongoose.model(
  "Funcionario",
  new mongoose.Schema(
    {
      cpf: { type: String, required: true },
      nome: { type: String, required: true },
      email: { type: String, required: true },
      telefone: { type: String, required: false },
      nascimento: { type: Date, required: true },
      senha: { type: String, required: true },
      genero: {
        type: String,
        enum: ["M", "F", "X"],
        default: "X",
        required: false,
      },
      servicos: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FuncionarioServico",
        },
      ],
      carros: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Carro",
        },
      ],
      cartoesChave: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CartaoChave",
        },
      ],
      cargo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cargo",
      },
      conexoes: [String],
    },
    { timestamps: { currentTime: Date.now }}
  )
);
module.exports = Funcionario;
