#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { templatesNode, templatesVite } = require("./templates");
const { encryptEnv, decryptEnv } = require("../../src"); // core functions

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Detect whether the current project uses Vite.
 * It checks package.json dependencies and known vite config files.
 * @returns {boolean} True if Vite is detected, otherwise false.
 */
function detectVite() {
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, "package.json");

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (
        (pkg.dependencies && pkg.dependencies.vite) ||
        (pkg.devDependencies && pkg.devDependencies.vite)
      ) {
        return true;
      }
    } catch { }
  }

  const viteConfigs = [
    "vite.config.js",
    "vite.config.ts",
    "vite.config.mjs",
    "vite.config.cjs",
  ];
  for (const file of viteConfigs) {
    if (fs.existsSync(path.join(cwd, file))) return true;
  }

  return false;
}

/**
 * Create an environment file based on template type.
 * @param {string} type - The environment type (e.g. "development", "production").
 * @param {Record<string, string>} templates - Map of template type to template content.
 */
function createEnvFile(type, templates) {
  const filename = `.env.${type}`;
  const envPath = path.join(process.cwd(), filename);

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, templates[type]);
    console.log(`✅ ${filename} has been created`);
  } else {
    console.log(`⚠️ ${filename} already exists, skipped`);
  }
}

/**
 * Initialize a custom .env file interactively.
 * Prompts the user for key-value pairs and writes to a new .env file.
 */
async function initCustom() {
  console.log("🚀 Dotenv Guard - Custom .env Generator\n");

  let content = "";

  const rlCustom = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function askKey() {
    return new Promise((resolve) => {
      rlCustom.question("Enter KEY (leave empty to finish): ", (key) => {
        if (!key) return resolve(null);
        rlCustom.question(`Enter VALUE for ${key}: `, (value) => {
          content += `${key}=${value}\n`;
          resolve(true);
        });
      });
    });
  }

  while (await askKey());

  if (!content) {
    console.log("⚠️ No key-value entered, file not created");
    rlCustom.close();
    return;
  }

  console.log("\nSelect ENV TYPE for this custom file:");
  const envTypes = [
    "development",
    "staging",
    "production",
    "test",
    "qa",
    "preview",
    "custom filename",
  ];
  envTypes.forEach((t, i) => console.log(`${i + 1}) ${t}`));

  rlCustom.question("> ", (choice) => {
    const idx = parseInt(choice) - 1;
    let filename;

    if (!envTypes[idx]) {
      console.log("❌ Invalid choice");
      rlCustom.close();
      return;
    }

    if (envTypes[idx] === "custom filename") {
      rlCustom.question(
        "Enter custom filename (example: .env.local): ",
        (name) => {
          filename = name.trim();
          if (!filename.startsWith(".env")) {
            filename = `.env.${filename}`;
          }
          fs.writeFileSync(path.join(process.cwd(), filename), content);
          console.log(`✅ ${filename} has been created`);
          rlCustom.close();
        }
      );
    } else {
      filename = `.env.${envTypes[idx]}`;
      fs.writeFileSync(path.join(process.cwd(), filename), content);
      console.log(`✅ ${filename} has been created`);
      rlCustom.close();
    }
  });
}

/**
 * Initialize environment files from templates.
 * If Vite is detected, use VITE_ prefix templates.
 */
async function initEnv() {
  const hasVite = detectVite();
  const templates = hasVite ? templatesVite : templatesNode;

  console.log("🚀 Dotenv Guard - Environment File Generator\n");
  if (hasVite) {
    console.log("⚡ Detected Vite project → using VITE_ prefix\n");
  } else {
    console.log("ℹ️ Standard Node.js project → using normal env keys\n");
  }

  console.log("Select ENV TYPE:");
  const types = Object.keys(templates);
  types.forEach((t, i) => console.log(`${i + 1}) ${t}`));
  console.log(`${types.length + 1}) All`);
  console.log(`${types.length + 2}) Custom`);

  rl.question("> ", (choice) => {
    const idx = parseInt(choice) - 1;

    if (choice == `${types.length + 1}`) {
      console.log("\n🚀 Generating all .env files...\n");
      types.forEach((t) => createEnvFile(t, templates));
      rl.close();
      return;
    }

    if (choice == `${types.length + 2}`) {
      rl.close();
      return initCustom();
    }

    const type = types[idx];
    if (!type) {
      console.log("❌ Invalid choice");
      rl.close();
      return;
    }

    createEnvFile(type, templates);
    rl.close();
  });
}

/**
 * Initialize env.schema.json file from an existing .env file.
 * Each key becomes required by default with a catch-all regex.
 * @param {string} [envFile=".env"] - The env file to base schema on.
 */
function initSchema(envFile = ".env") {
  const envPath = path.join(process.cwd(), envFile);

  if (!fs.existsSync(envPath)) {
    console.error(`❌ ${envFile} not found`);
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split("\n").filter((l) => l && !l.startsWith("#"));

  let schema = {};
  for (const line of lines) {
    const [key] = line.split("=");
    schema[key.trim()] = {
      regex: ".*",
      required: true,
    };
  }

  const schemaPath = path.join(process.cwd(), "env.schema.json");
  if (fs.existsSync(schemaPath)) {
    console.error("⚠️ env.schema.json already exists, skipped");
    return;
  }

  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
  console.log("✅ env.schema.json has been created from " + envFile);
}

/**
 * Encrypt all values in a given .env file.
 * @param {string} [file=".env"] - Path to env file to encrypt.
 */
async function runEncrypt(file = ".env") {
  try {
    await encryptEnv(file);
    console.log(`✅ ${file} has been encrypted`);
  } catch (err) {
    console.error("❌ Failed to encrypt:", err.message);
  }
}

/**
 * Decrypt all values in a given .env file.
 * Writes back plaintext to the file.
 * @param {string} [file=".env"] - Path to env file to decrypt.
 */
async function runDecrypt(file = ".env") {
  try {
    const plain = await decryptEnv(file);
    fs.writeFileSync(path.join(process.cwd(), file), plain);
    console.log(`✅ ${file} has been decrypted`);
  } catch (err) {
    console.error("❌ Failed to decrypt:", err.message);
  }
}

/**
 * Print version from package.json.
 */
function showVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../package.json"), "utf8")
    );
    console.log(`dotenv-guard version ${pkg.version}`);
  } catch {
    console.error("⚠️ Cannot read version");
  }
}

// ---------- CLI Entry ----------
const args = process.argv.slice(2);
if (args[0] === "init" || args[0] === "create") {
  if (args[1] === "custom") {
    initCustom();
  } else if (args[1] === "schema") {
    initSchema(args[2] || ".env");
    rl.close();
  } else {
    initEnv();
  }
} else if (args[0] === "encrypt") {
  rl.close();
  runEncrypt(args[1] || ".env");
} else if (args[0] === "decrypt") {
  rl.close();
  runDecrypt(args[1] || ".env");
} else if (args[0] === "-v" || args[0] === "-version") {
  showVersion();
  rl.close();
} else {
  console.log("Usage: npx dotenv-guard init");
  console.log("       npx dotenv-guard init custom");
  console.log("       npx dotenv-guard init schema [file]");
  console.log("       npx dotenv-guard encrypt [file]");
  console.log("       npx dotenv-guard decrypt [file]");
  console.log("       npx dotenv-guard -v");
  rl.close();
}

// Export functions for testing
module.exports = {
  detectVite,
  createEnvFile,
  initSchema,
  runEncrypt,
  runDecrypt,
};
