# dotenv-guard

[![npm version](https://img.shields.io/npm/v/@ibnushahraa/dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/dotenv-guard)
[![npm downloads](https://img.shields.io/npm/dm/@ibnushahraa/dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/dotenv-guard)
[![CI](https://github.com/ibnushahraa/dotenv-guard/actions/workflows/test.yml/badge.svg)](https://github.com/ibnushahraa/dotenv-guard/actions/workflows/test.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

🔐 Secure & validate your `.env` files with **encryption**, **schema validation**, and **CLI tools**.  
Think of it as **dotenv on steroids** — with guardrails for production-ready apps.

---

## ✨ Features

- 🔒 **AES-256-CBC Encryption** → keep `.env` secrets safe
- 🗝 **System Keychain (via keytar)** → encryption key stored securely
- ✅ **Schema Validation** → enforce required keys, regex patterns, enums
- ⚡ **CLI Generator** → auto-generate `.env.*` (Node or Vite)
- 🔄 **Sync API** → drop-in replacement for `dotenv.config()` (no `await`)

---

## 📦 Installation

```bash
npm install @ibnushahraa/dotenv-guard
```

---

## 🚀 Usage

### 1. Basic (like dotenv)

```js
// CommonJS
require("@ibnushahraa/dotenv-guard").config();

// ESM
import { config } from "@ibnushahraa/dotenv-guard";
config();

console.log(process.env.DB_HOST);
```

---

### 2. With schema validation

Create `env.schema.json`:

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

Enable validator:

```js
import { config } from "@ibnushahraa/dotenv-guard";

config({ validator: true });
```

If invalid → app exits (`process.exit(1)`).

---

### 3. Vite Projects

```js
// vite.config.js
import { config } from "@ibnushahraa/dotenv-guard";

config({
  path: ".env",
  enc: false, // keep plaintext for Vite
  validator: true, // optional if env.schema.json exists
});
```

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
npx dotenv-guard encrypt [file]  # encrypt .env
npx dotenv-guard decrypt [file]  # decrypt .env
npx dotenv-guard -v              # show version
```

- Auto-detects **Node** or **Vite**
- Creates `.env.development`, `.env.production`, etc.

---

## 🧪 Testing

```bash
npm test
```

---

## 📜 License

[MIT](LICENSE) © 2025

---

## 💡 Notes

- Not a replacement for dotenv → a **secure extension**
- Store only **encrypted `.env`** + `env.schema.json` in git
- Sync API (no async/await needed)
