const mongoose = require("mongoose");
const Relato = mongoose.model(
  "Relato",
  new mongoose.Schema(
    {
      texto: { type: String, required: true },
      hospede:
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospede",
      },
    },
    { timestamps: { currentTime: Date.now } }
  )
);
module.exports = Relato;
