const mongoose = require("mongoose");
const LogCarro = mongoose.model(
  "LogCarro",
  new mongoose.Schema(
    {
      status: { type: String, required: true },
      carro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Carro",
      }
    },
    { timestamps: { currentTime: Date.now } }
  )
);
module.exports = LogCarro;
