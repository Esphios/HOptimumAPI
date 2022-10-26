const mongoose = require("mongoose");
const Reserva = mongoose.model(
  "Reserva",
  new mongoose.Schema(
    {
      status: {
        type: String,
        enum: ["ATIVA", "FINALIZADA", "CANCELADA"],
        default: "ATIVA",
        required: true,
      },
      quarto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quarto",
      },
      servicos: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Servico",
        }
      ],
      hospedes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "HospedeReserva"
        }
      ],
      cartoesChave: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CartaoChave",
        },
      ],
    },
    { timestamps: { currentTime: Date.now }}
  )
);
module.exports = Reserva;
