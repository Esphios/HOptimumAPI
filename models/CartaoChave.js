const mongoose = require("mongoose");
const CartaoChave = mongoose.model(
  "CartaoChave",
  new mongoose.Schema(
    {
      codigo: { type: String, required: true },
    },
    { timestamps: true }
  )
);
module.exports = CartaoChave;
