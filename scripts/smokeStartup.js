const http = require("http");
const { spawn } = require("child_process");

const port = 3200 + Math.floor(Math.random() * 500);
const startedAt = Date.now();
const child = spawn(process.execPath, ["server.js"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(port),
    MONGODB_URI: "mongodb://127.0.0.1:27018/hoptimum_test",
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const request = (path) =>
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

const waitForHttp = async (path, expectedStatus, timeoutMs) => {
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await request(path);
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

const waitForExit = (timeoutMs) =>
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
  try {
    await waitForHttp("/health/liveness", 200, 8000);
    await waitForHttp("/health/readiness", 503, 8000);

    const exitCode = await waitForExit(16000);
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
  console.error(output);
  process.exit(1);
});
