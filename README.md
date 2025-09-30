# dotenv-guard

[![npm version](https://img.shields.io/npm/v/dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/dotenv-guard)
[![npm downloads](https://img.shields.io/npm/dm/dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/dotenv-guard)
[![build](https://img.shields.io/github/actions/workflow/status/ibscode/dotenv-guard/test.yml?branch=main&style=flat-square)]()
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

🔐 Secure & validate your `.env` files with **encryption**, **schema validation**, and **CLI tools**.  
Think of it as **dotenv on steroids** — with extra guardrails for production-ready apps.

---

## ✨ Features

- 🔒 **AES-256-CBC Encryption** → keep your `.env` secrets safe at rest
- 🗝 **System Keychain (via keytar)** → encryption key stored securely
- ✅ **Schema Validation** → enforce required keys, regex patterns, and enums
- ⚡ **CLI Generator** → auto-generate `.env.*` files (Node or Vite projects)
- 🔄 **Drop-in replacement** for `dotenv.config()`

---

## 📦 Installation

```bash
npm install dotenv-guard
```

---

## 🚀 Usage

### 1. Basic (like dotenv)

```js
require("dotenv-guard").config();

console.log(process.env.DB_HOST);
```

---

### 2. With schema validation

Create a file `env.schema.json`:

```json
{
  "DB_HOST": { "required": true, "regex": "^[a-zA-Z0-9_.-]+$" },
  "DB_PORT": { "required": true, "regex": "^[0-9]+$" },
  "NODE_ENV": {
    "required": true,
    "enum": ["development", "production", "test"]
  }
}
```

Then enable validator:

```js
require("dotenv-guard").config({ validator: true });
```

If any env variable is missing or invalid → the app will exit (`process.exit(1)`).

---

### 3. Encrypt / Decrypt manually

```js
const { encryptEnv, decryptEnv, loadEnv } = require("dotenv-guard");

// Encrypt .env (in-place)
await encryptEnv(".env");

// Decrypt into string
const plain = await decryptEnv(".env");
console.log(plain);

// Load & inject into process.env (auto decrypt)
await loadEnv(".env");
```

> The encryption key is automatically generated and securely stored in the system keychain (`keytar`).

---

## 🖥 CLI Usage

```bash
npx dotenv-guard init
```

Options:

```bash
npx dotenv-guard init            # choose template
npx dotenv-guard init custom     # interactive key-value input
npx dotenv-guard init schema     # generate env.schema.json from .env
npx dotenv-guard -v              # show version
```

- Automatically detects **Node** or **Vite** project
- Creates `.env.development`, `.env.production`, etc.

---

## 🧪 Testing

Run tests with Jest:

```bash
npm test
```

With coverage:

```bash
npm test -- --coverage
```

---

## 📜 License

[MIT](LICENSE) © 2025

---

## 💡 Notes

- This is not a replacement for dotenv, but a **secure extension**
- Use schema validation to prevent invalid envs in production
- Best practice: commit only encrypted `.env` files + schema, not plaintext
