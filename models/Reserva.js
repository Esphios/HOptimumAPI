const mongoose = require("mongoose");
const Reserva = mongoose.model(
  "Reserva",
  new mongoose.Schema(
    {
      checkIn: Date,
      checkOut: Date,
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
          ref: "ReservaServico",
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
