const mongoose = require("mongoose");
const LogCarro = mongoose.model(
  "LogCarro",
  new mongoose.Schema(
    {
      status: { type: String, required: true },
    },
    { timestamps: { currentTime: Date.now }}
  )
);
module.exports = LogCarro;
