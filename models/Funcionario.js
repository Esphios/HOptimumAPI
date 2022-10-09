const mongoose = require("mongoose");
const Funcionario = mongoose.model(
  "Funcionario",
  new mongoose.Schema(
    {
      cpf: { type: String, required: true },
      nome: { type: String, required: true },
      telefone: { type: String, required: false },
      nascimento: { type: Date, required: true },
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
      // connections: [{ id: String, date: {type:String, default: new Date()} }]
    },
    { timestamps: true }
  )
);
module.exports = Funcionario;
