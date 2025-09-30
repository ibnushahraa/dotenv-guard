const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const keytar = require("keytar");

const SERVICE = "dotenv-guard";
const ACCOUNT = "default";

async function getOrCreateKey() {
  let key = await keytar.getPassword(SERVICE, ACCOUNT);
  if (!key) {
    key = crypto.randomBytes(32).toString("hex");
    await keytar.setPassword(SERVICE, ACCOUNT, key);
    console.log("🔑 New encryption key stored in system keychain");
  }
  return key;
}

// Enkripsi isi file .env → timpa file aslinya
async function encryptEnv(file = ".env") {
  const key = await getOrCreateKey();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    iv
  );
  const envContent = fs.readFileSync(path.join(process.cwd(), file), "utf8");

  let encrypted = cipher.update(envContent, "utf8", "hex");
  encrypted += cipher.final("hex");

  const encryptedData = iv.toString("hex") + ":" + encrypted;

  fs.writeFileSync(path.join(process.cwd(), file), encryptedData);
  console.log(`✅ ${file} encrypted`);
}

// Dekripsi isi file .env → return plain text
async function decryptEnv(file = ".env") {
  const key = await getOrCreateKey();
  const data = fs.readFileSync(path.join(process.cwd(), file), "utf8");

  if (!data.includes(":")) {
    // berarti masih plaintext
    return data;
  }

  const [ivHex, encrypted] = data.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(key, "hex"),
    iv
  );

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Parse & inject ke process.env
function injectToProcess(content) {
  content.split("\n").forEach((line) => {
    if (!line || line.startsWith("#")) return;
    const [key, ...rest] = line.split("=");
    const value = rest.join("=").trim();
    if (key) process.env[key] = value;
  });
}

// Load schema
function loadSchema(schemaFile = "env.schema.json") {
  const schemaPath = path.join(process.cwd(), schemaFile);
  if (!fs.existsSync(schemaPath)) return null;
  return JSON.parse(fs.readFileSync(schemaPath, "utf8"));
}

// Validator
function validateEnv(env, schema) {
  let errors = [];

  for (const key in schema) {
    const rules = schema[key];
    const value = env[key];

    if (rules.required !== false && !value) {
      errors.push(`❌ Missing required env: ${key}`);
      continue;
    }

    if (rules.regex && value && !new RegExp(rules.regex).test(value)) {
      errors.push(`❌ Env ${key}="${value}" does not match ${rules.regex}`);
    }

    if (rules.enum && value && !rules.enum.includes(value)) {
      errors.push(
        `❌ Env ${key}="${value}" must be one of: ${rules.enum.join(", ")}`
      );
    }
  }

  if (errors.length) {
    errors.forEach((e) => console.error(e));
    console.error("⛔ dotenv-guard: Validation failed. Application stopped.");
    process.exit(1);
  } else {
    console.log("✅ .env validation passed");
  }
}

// Load env dengan auto decrypt
async function loadEnv(file = ".env") {
  const plain = await decryptEnv(file);
  injectToProcess(plain);
  console.log(`⚡ ${file} loaded into process.env`);
}

// API mirip dotenv.config()
async function config(options = {}) {
  const enc = options.enc !== false; // default true
  const file = options.path || ".env";

  try {
    let plain;
    if (enc) {
      plain = await decryptEnv(file);
      if (!plain.includes("=")) {
        // sudah terenkripsi, langsung inject
        injectToProcess(plain);
      } else {
        // masih plaintext, enkripsi dulu lalu inject
        await encryptEnv(file);
        plain = await decryptEnv(file);
        injectToProcess(plain);
      }
    } else {
      plain = await decryptEnv(file); // kalau sudah terenkripsi → auto decrypt
      injectToProcess(plain);
    }

    // ---- VALIDATOR ----
    if (options.validator) {
      const schema = loadSchema(options.schema || "env.schema.json");
      if (schema) {
        validateEnv(process.env, schema);
      } else {
        console.warn("⚠️ validator aktif, tapi schema tidak ditemukan");
      }
    }
  } catch (err) {
    console.error("❌ Failed to process env:", err.message);
    process.exit(1);
  }
}

module.exports = {
  encryptEnv,
  decryptEnv,
  loadEnv,
  config,
};
