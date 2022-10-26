const mongoose = require("mongoose");

var HospedeReservaSchema = new mongoose.Schema(
  {
    titular: {
      type: Boolean,
      default: true
    },
    hospedeId: {
      type: String,
    },
    reservaId: {
      type: String,
    },
  },
  { timestamps: { currentTime: Date.now }}
);

HospedeReservaSchema.virtual("hospede", {
  ref: "Hospede",
  localField: "hospedeId",
  foreignField: "_id",
  justOne: true,
});

HospedeReservaSchema.virtual("reserva", {
  ref: "Reserva",
  localField: "reservaId",
  foreignField: "_id",
  justOne: true,
});

HospedeReservaSchema.set("toObject", { virtuals: true });
HospedeReservaSchema.set("toJSON", { virtuals: true });

const HospedeReserva = mongoose.model("HospedeReserva", HospedeReservaSchema);
module.exports = HospedeReserva;
