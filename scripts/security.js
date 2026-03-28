const crypto = require("crypto");
const { promisify } = require("util");

const scryptAsync = promisify(crypto.scrypt);
const TOKEN_VERSION = 1;
const PASSWORD_PREFIX = "scrypt";
const DEFAULT_TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

const base64UrlEncode = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
};

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getTokenSecret = () => process.env.AUTH_TOKEN_SECRET;
const getEspSharedSecret = () => process.env.ESP_SHARED_SECRET;

const getTokenTtlMs = () =>
  parsePositiveInteger(process.env.AUTH_TOKEN_TTL_MS, DEFAULT_TOKEN_TTL_MS);

const isPasswordHash = (value) =>
  typeof value === "string" && value.startsWith(`${PASSWORD_PREFIX}$`);

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);

  return `${PASSWORD_PREFIX}$${salt}$${Buffer.from(derivedKey).toString("hex")}`;
};

const verifyPassword = async (password, storedValue) => {
  if (typeof password !== "string" || typeof storedValue !== "string") {
    return false;
  }

  if (!isPasswordHash(storedValue)) {
    return storedValue === password;
  }

  const [, salt, expectedHex] = storedValue.split("$");
  if (!salt || !expectedHex) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(await scryptAsync(password, salt, expected.length));

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

const signTokenPayload = (payload) =>
  crypto.createHmac("sha256", getTokenSecret()).update(payload).digest("base64url");

const issueAuthToken = ({ userId, userType, roleName = null }) => {
  const header = base64UrlEncode(
    JSON.stringify({
      alg: "HS256",
      typ: "JWT",
      ver: TOKEN_VERSION,
    })
  );

  const issuedAt = Date.now();
  const body = base64UrlEncode(
    JSON.stringify({
      sub: String(userId),
      type: userType,
      role: roleName,
      iat: issuedAt,
      exp: issuedAt + getTokenTtlMs(),
    })
  );
  const signature = signTokenPayload(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
};

const verifyAuthToken = (token) => {
  if (typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [header, body, signature] = parts;
  const expectedSignature = signTokenPayload(`${header}.${body}`);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(body));
  if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
    return null;
  }

  return {
    userId: payload.sub,
    userType: payload.type,
    roleName: payload.role,
  };
};

const extractBearerToken = (authorizationHeader) => {
  if (typeof authorizationHeader !== "string") {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const getRequestAuth = (req) => {
  const token = extractBearerToken(req.headers.authorization);

  return token ? verifyAuthToken(token) : null;
};

const requireAuth =
  ({ allowTypes = null } = {}) =>
  (req, res, next) => {
    const auth = getRequestAuth(req);

    if (!auth) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (Array.isArray(allowTypes) && !allowTypes.includes(auth.userType)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.auth = auth;
    return next();
  };

const requireEspAuth = (req, res, next) => {
  const candidate = req.headers["x-esp-secret"];

  if (
    typeof candidate !== "string" ||
    typeof getEspSharedSecret() !== "string" ||
    candidate !== getEspSharedSecret()
  ) {
    return res.status(401).json({ error: "Device authentication required" });
  }

  return next();
};

const sanitizeResponseDocument = (document) => {
  if (document == null) {
    return document;
  }

  const plain =
    typeof document.toObject === "function"
      ? document.toObject({ versionKey: false })
      : JSON.parse(JSON.stringify(document));

  delete plain.senha;
  delete plain.conexoes;
  return plain;
};

const isAllowedWsOrigin = (origin) => {
  if (typeof origin !== "string" || origin.length === 0) {
    return true;
  }

  const configuredOrigins = (process.env.ALLOWED_WS_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (configuredOrigins.length === 0) {
    return true;
  }

  return configuredOrigins.includes(origin);
};

module.exports = {
  getTokenSecret,
  getEspSharedSecret,
  hashPassword,
  isAllowedWsOrigin,
  isPasswordHash,
  issueAuthToken,
  requireAuth,
  requireEspAuth,
  sanitizeResponseDocument,
  verifyAuthToken,
  verifyPassword,
};
