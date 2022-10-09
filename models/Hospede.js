const mongoose = require("mongoose");
const Hospede = mongoose.model(
  "Hospede",
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
      senha: { type: String, required: true },
      reservas: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "HospedeReserva",
        },
      ],
      carros: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Carro",
        },
      ],
    },
    { timestamps: true }
  )
);
module.exports = Hospede;
