const mongoose = require("mongoose");
const LogCarro = mongoose.model(
  "LogCarro",
  new mongoose.Schema(
    {
      status: { type: String, required: true },
    },
    { timestamps: true }
  )
);
module.exports = LogCarro;
