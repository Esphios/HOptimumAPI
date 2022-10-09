const express = require("express");
const routes = require("./routes/api");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/public", express.static(process.cwd() + "/public")); //make public static
app.use("/", routes);

const http = require("http").Server(app);

//establish connection to database
const mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGODB_URI,
  {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
  function (err) {
    if (err) return console.log("Error: ", err);
    console.log(
      "MongoDB Connection -- Ready state is:",
      mongoose.connection.readyState
    );
  }
);

const script = require("./scripts/testDatabase");
script.dropAll();
script.run();

const listener = http.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
