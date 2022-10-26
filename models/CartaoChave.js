const mongoose = require("mongoose");
const CartaoChave = mongoose.model(
  "CartaoChave",
  new mongoose.Schema(
    {
      codigo: { type: String, required: true },
    },
    { timestamps: { currentTime: Date.now }}
  )
);
module.exports = CartaoChave;
