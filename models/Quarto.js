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
      Registros: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LogQuarto",
        }
      ]
    },
    { timestamps: true }
  )
);
module.exports = Quarto;
