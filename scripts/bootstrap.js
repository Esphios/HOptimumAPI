const mongoose = require("mongoose");
const { resetAllConnections } = require("./testDatabase");
const startupState = require("./startupState");

const DEFAULT_MONGODB_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
const DEFAULT_CONNECT_RETRIES = 5;
const DEFAULT_RETRY_DELAY_MS = 2000;

const validateConfig = () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required");
  }
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientMongoError = (error) => {
  if (!error) {
    return false;
  }

  return [
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "EHOSTUNREACH",
    "MongooseServerSelectionError",
  ].includes(error.code || error.name);
};

const getConnectRetryPolicy = () => ({
  maxAttempts: Number(process.env.MONGODB_CONNECT_MAX_ATTEMPTS || DEFAULT_CONNECT_RETRIES),
  delayMs: Number(process.env.MONGODB_CONNECT_RETRY_DELAY_MS || DEFAULT_RETRY_DELAY_MS),
});

const connectMongo = async (
  options = DEFAULT_MONGODB_OPTIONS,
  retryPolicy = getConnectRetryPolicy()
) => {
  startupState.recordMongoAttempt();
  startupState.markPhase("connecting_mongo");

  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
    startupState.setMongoConnected(true);
    startupState.setLastError(null);
  } catch (error) {
    startupState.setMongoConnected(false);
    startupState.setLastError(error);

    const hasAttemptsLeft = startupState.cloneState().mongo.attempts < retryPolicy.maxAttempts;
    if (!isTransientMongoError(error) || !hasAttemptsLeft) {
      throw error;
    }

    console.warn(
      `MongoDB connection attempt ${startupState.cloneState().mongo.attempts} failed. Retrying in ${retryPolicy.delayMs}ms.`
    );
    await wait(retryPolicy.delayMs);
    return connectMongo(options, retryPolicy);
  }
};

const runMandatoryStartupTasks = async () => {
  startupState.markPhase("running_startup_tasks");
  await resetAllConnections();
};

const disconnectMongo = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  startupState.setMongoConnected(false);
};

module.exports = {
  DEFAULT_MONGODB_OPTIONS,
  connectMongo,
  disconnectMongo,
  getConnectRetryPolicy,
  isTransientMongoError,
  runMandatoryStartupTasks,
  validateConfig,
};
