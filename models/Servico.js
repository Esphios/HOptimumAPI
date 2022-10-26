const mongoose = require("mongoose");
const Servico = mongoose.model(
  "Servico",
  new mongoose.Schema(
    {
      nome: { type: String, required: true },
      status: String,
      funcionarios: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FuncionarioServico",
        },
      ],
    },
    { timestamps: { currentTime: Date.now } }
  )
);
module.exports = Servico;
