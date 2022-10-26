const mongoose = require("mongoose");
const Cargo = mongoose.model(
  "Cargo",
  new mongoose.Schema(
    {
      nome: { type: String, required: true },
      salarioBase: { type: Number, required: true },
    },
    { timestamps: { currentTime: Date.now }}
  )
);
module.exports = Cargo;
