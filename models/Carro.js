const mongoose = require("mongoose");
const Carro = mongoose.model(
  "Carro",
  new mongoose.Schema(
    {
      cor: { type: String, required: true },
      modelo: { type: String, required: true },
      placa: { type: String, required: true },
      registros: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LogCarro",
        }
      ]
    },
    { timestamps: { currentTime: Date.now }}
  )
);
module.exports = Carro;
