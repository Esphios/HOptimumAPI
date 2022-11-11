const mongoose = require("mongoose");
const Servico = mongoose.model(
  "Servico",
  new mongoose.Schema(
    {
      nome: { type: String, required: true },
      tipo: { type: String, required: true },
      preco: Number,
      imgUrl: String,
      reservas: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ReservaServico",
        },
      ],
    },
    { timestamps: { currentTime: Date.now } }
  )
);
module.exports = Servico;
