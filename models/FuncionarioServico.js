const mongoose = require("mongoose");

var FuncionarioServicoSchema = new mongoose.Schema(
  {
    funcionarioId: {
      type: String,
    },
    servicoId: {
      type: String,
    },
  },
  { timestamps: true }
);

FuncionarioServicoSchema.virtual("funcionario", {
  ref: "Funcionario",
  localField: "funcionarioId",
  foreignField: "_id",
  justOne: true,
});

FuncionarioServicoSchema.virtual("servico", {
  ref: "Servico",
  localField: "servicoId",
  foreignField: "_id",
  justOne: true,
});

FuncionarioServicoSchema.set("toObject", { virtuals: true });
FuncionarioServicoSchema.set("toJSON", { virtuals: true });

const FuncionarioServico = mongoose.model(
  "FuncionarioServico",
  FuncionarioServicoSchema
);
module.exports = FuncionarioServico;
