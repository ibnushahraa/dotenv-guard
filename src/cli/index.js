#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { templatesNode, templatesVite } = require("./templates");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ---------- Detect Vite ----------
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
    } catch {}
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

// ---------- Create File ----------
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

// ---------- Custom Mode ----------
async function initCustom() {
  console.log("🚀 Dotenv Guard - Custom .env Generator\n");

  let content = "";

  // buat readline baru untuk custom
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

  // Pilih type untuk nama file
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

// ---------- Init with Templates ----------
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

// ---------- Init Schema ----------
function initSchema(envFile = ".env") {
  const envPath = path.join(process.cwd(), envFile);

  if (!fs.existsSync(envPath)) {
    console.log(`❌ ${envFile} not found`);
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split("\n").filter((l) => l && !l.startsWith("#"));

  let schema = {};
  for (const line of lines) {
    const [key] = line.split("=");
    schema[key.trim()] = {
      regex: ".*", // default regex
      required: true,
    };
  }

  const schemaPath = path.join(process.cwd(), "env.schema.json");
  if (fs.existsSync(schemaPath)) {
    console.log("⚠️ env.schema.json already exists, skipped");
    return;
  }

  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
  console.log("✅ env.schema.json has been created from " + envFile);
}

// ---------- Show version ----------
function showVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../package.json"), "utf8")
    );
    console.log(`dotenv-guard version ${pkg.version}`);
  } catch {
    console.log("⚠️ Cannot read version");
  }
}

// ---------- CLI Entry ----------
const args = process.argv.slice(2);
if (args[0] === "init" || args[0] === "create") {
  if (args[1] === "custom") {
    initCustom();
  } else if (args[1] === "schema") {
    initSchema(args[2] || ".env"); // default pakai .env
    rl.close();
  } else {
    initEnv();
  }
} else if (args[0] === "-v" || args[0] === "-version") {
  showVersion();
  rl.close();
} else {
  console.log("Usage: npx dotenv-guard init");
  console.log("       npx dotenv-guard init custom");
  console.log("       npx dotenv-guard init schema [file]");
  console.log("       npx dotenv-guard -v");
  rl.close();
}

// Export function untuk keperluan test
module.exports = {
  detectVite,
  createEnvFile,
  initSchema,
};
