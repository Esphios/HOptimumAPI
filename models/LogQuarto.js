const mongoose = require("mongoose");
const LogQuarto = mongoose.model(
  "LogQuarto",
  new mongoose.Schema(
    {
      funcionario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Funcionario",
      },
      reserva: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reserva",
      },
      cartao: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CartaoChave",
      },
    },
    { timestamps: { currentTime: Date.now }}
  )
);
module.exports = LogQuarto;
