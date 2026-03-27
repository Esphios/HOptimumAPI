const state = {
  phase: "idle",
  ready: false,
  startedAt: null,
  mongo: {
    connected: false,
    attempts: 0,
    lastError: null,
  },
  lastError: null,
};

const cloneState = () => ({
  phase: state.phase,
  ready: state.ready,
  startedAt: state.startedAt,
  mongo: { ...state.mongo },
  lastError: state.lastError
    ? {
        name: state.lastError.name,
        message: state.lastError.message,
      }
    : null,
});

const markPhase = (phase) => {
  state.phase = phase;
  if (!state.startedAt) {
    state.startedAt = new Date().toISOString();
  }
};

const setReady = (ready) => {
  state.ready = ready;
};

const recordMongoAttempt = () => {
  state.mongo.attempts += 1;
};

const setMongoConnected = (connected) => {
  state.mongo.connected = connected;
};

const setLastError = (error) => {
  state.lastError = error || null;
  state.mongo.lastError = error
    ? {
        name: error.name,
        message: error.message,
      }
    : null;
};

module.exports = {
  cloneState,
  markPhase,
  recordMongoAttempt,
  setLastError,
  setMongoConnected,
  setReady,
};
