const mongoose = require("mongoose");
const { resetAllConnections } = require("./testDatabase");
const startupState = require("./startupState");

const DEFAULT_MONGODB_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

const validateConfig = () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }
};

const connectMongo = async (options = DEFAULT_MONGODB_OPTIONS) => {
  startupState.recordMongoAttempt();
  startupState.markPhase("connecting_mongo");

  await mongoose.connect(process.env.MONGODB_URI, options);
  startupState.setMongoConnected(true);
};

const runMandatoryStartupTasks = async () => {
  startupState.markPhase("running_startup_tasks");
  await resetAllConnections();
};

module.exports = {
  DEFAULT_MONGODB_OPTIONS,
  connectMongo,
  runMandatoryStartupTasks,
  validateConfig,
};
