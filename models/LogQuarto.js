const mongoose = require("mongoose");
const LogQuarto = mongoose.model(
  "LogQuarto",
  new mongoose.Schema(
    {
      Funcionario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Funcionario",
      },
      Hospede: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospede",
      },
    },
    { timestamps: true }
  )
);
module.exports = LogQuarto;
