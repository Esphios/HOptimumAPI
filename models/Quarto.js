const mongoose = require("mongoose");
const Quarto = mongoose.model(
  "Quarto",
  new mongoose.Schema(
    {
      nome: { type: String, required: true },
      numero: { type: String, required: true },
      macAddressEsp: { type: String, required: true },
      maxOcupantes: { type: Number, required: true },
      precoBase: { type: Number, required: true },
      ocupado: { type: Boolean, defaul: false, required: true },
      registros: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LogQuarto",
        }
      ]
    },
    { timestamps: { currentTime: Date.now }}
  )
);
module.exports = Quarto;
