const http = require("http");
const net = require("net");
const { spawn } = require("child_process");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const getAvailablePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });

const request = (port, path) =>
  new Promise((resolve, reject) => {
    const req = http.get(
      {
        hostname: "127.0.0.1",
        port,
        path,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk.toString();
        });
        res.on("end", () => resolve({ statusCode: res.statusCode, body }));
      }
    );

    req.on("error", reject);
  });

const waitForHttp = async (port, startedAt, path, expectedStatus, timeoutMs) => {
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await request(port, path);
      if (response.statusCode === expectedStatus) {
        return response;
      }
    } catch (error) {
      if (error.code !== "ECONNREFUSED") {
        throw error;
      }
    }

    await wait(100);
  }

  throw new Error(`Timed out waiting for ${path} to return ${expectedStatus}`);
};

const waitForExit = (child, timeoutMs) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out waiting for server process to exit"));
    }, timeoutMs);

    child.once("exit", (code) => {
      clearTimeout(timeout);
      resolve(code);
    });
  });

const run = async () => {
  const port = await getAvailablePort();
  const unavailableMongoPort = await getAvailablePort();
  const startedAt = Date.now();
  const child = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      MONGODB_URI: `mongodb://127.0.0.1:${unavailableMongoPort}/hoptimum_test`,
      MONGODB_CONNECT_MAX_ATTEMPTS: "2",
      MONGODB_CONNECT_RETRY_DELAY_MS: "250",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";

  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });

  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  try {
    await waitForHttp(port, startedAt, "/health/liveness", 200, 8000);
    await waitForHttp(port, startedAt, "/health/readiness", 503, 8000);

    const exitCode = await waitForExit(child, 16000);
    if (exitCode !== 1) {
      throw new Error(`Expected exit code 1, received ${exitCode}`);
    }

    if (!output.includes("Startup failure")) {
      throw new Error("Expected startup failure log was not emitted");
    }

    console.log("startup smoke test passed");
  } finally {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
