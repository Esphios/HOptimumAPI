const mongoose = require("mongoose");

var ReservaServicoSchema = new mongoose.Schema(
  {
    reservaId: {
      type: String,
    },
    servicoId: {
      type: String,
    },
    funcionario:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Funcionario",
    },
    status:
    {
      type: String,
      default: "espera",
    },
  },
  { timestamps: { currentTime: Date.now }}
);

ReservaServicoSchema.virtual("reserva", {
  ref: "Reserva",
  localField: "reservaId",
  foreignField: "_id",
  justOne: true,
});

ReservaServicoSchema.virtual("servico", {
  ref: "Servico",
  localField: "servicoId",
  foreignField: "_id",
  justOne: true,
});

ReservaServicoSchema.set("toObject", { virtuals: true });
ReservaServicoSchema.set("toJSON", { virtuals: true });

const ReservaServico = mongoose.model(
  "ReservaServico",
  ReservaServicoSchema
);
module.exports = ReservaServico;
