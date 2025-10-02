# @ibnushahraa/dotenv-guard

[![npm version](https://img.shields.io/npm/v/@ibnushahraa/dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/dotenv-guard)
[![npm downloads](https://img.shields.io/npm/dm/@ibnushahraa/dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/dotenv-guard)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![CI](https://github.com/ibnushahraa/dotenv-guard/actions/workflows/test.yml/badge.svg)](https://github.com/ibnushahraa/dotenv-guard/actions)

🔐 Secure & validate your `.env` files with **encryption**, **schema validation**, and **CLI tools**.
Think of it as **dotenv on steroids** — with guardrails for production-ready apps.

---

## ✨ Features

- 🔒 **AES-256-CBC Encryption** → keep `.env` secrets safe
- 🗝 **System Keychain (via keytar)** → encryption key stored securely
- ✅ **Schema Validation** → enforce required keys, regex patterns, enums
- ⚡ **CLI Generator** → auto-generate `.env.*` (Node or Vite)
- 🔄 **Sync API** → drop-in replacement for `dotenv.config()` (no `await`)
- 🌍 **Multi-Environment** → auto-load `.env.[mode]` based on NODE_ENV
- 🛡️ **Vite Security** → safe template with proper VITE_ prefix usage
- 📦 **Zero Runtime Config** → works with CommonJS & ESM

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

### 3. Vite Projects (Multi-Environment)

**Option 1: Use the Vite Plugin** (recommended)

```bash
npm install @ibnushahraa/vite-plugin-dotenv-guard
```

```js
// vite.config.js
import dotenvGuard from '@ibnushahraa/vite-plugin-dotenv-guard';

export default defineConfig({
  plugins: [
    dotenvGuard({
      validator: true
    })
  ]
});
```

**Option 2: Manual Config**

```js
// vite.config.js
import { config } from "@ibnushahraa/dotenv-guard";

config({
  multiEnv: true,  // Auto-load based on NODE_ENV
  mode: process.env.NODE_ENV || 'development',
  enc: false,      // Keep plaintext for Vite
  validator: true
});

// Files loaded in priority order:
// .env → .env.local → .env.[mode] → .env.[mode].local
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

## 📚 API Reference

### `config(options)`

Main function to load and validate environment variables.

```javascript
const { config } = require('@ibnushahraa/dotenv-guard');

config({
  path: '.env',              // Single file path (default: '.env')
  mode: 'development',       // Environment mode for multiEnv
  multiEnv: false,          // Enable multi-file loading
  enc: true,                // Enable encryption (default: true)
  validator: false,         // Enable schema validation
  schema: 'env.schema.json' // Schema file path
});

// After config(), all env vars are loaded to process.env
console.log(process.env.DB_HOST);
```

**Common use cases:**

```javascript
// Basic usage (like dotenv)
config();

// With validation
config({ validator: true });

// Multi-environment (Vite)
config({ multiEnv: true, mode: 'development', enc: false });

// Without encryption (for Vite)
config({ enc: false });
```

---

## 🧪 Testing

```bash
npm test
```

All tests cover:
- ✅ Encryption/Decryption
- ✅ Multi-environment loading
- ✅ Schema validation
- ✅ CLI commands
- ✅ CommonJS & ESM imports
- ✅ Vite detection

---

## 💡 Why dotenv-guard?

| Feature | dotenv | dotenv-guard |
|---------|--------|--------------|
| Load .env files | ✅ | ✅ |
| Encryption | ❌ | ✅ AES-256-CBC |
| Schema validation | ❌ | ✅ Regex + Enum |
| Multi-environment | ❌ | ✅ Auto-load |
| CLI tools | ❌ | ✅ Full-featured |
| Vite optimization | ❌ | ✅ Security-first |
| System keychain | ❌ | ✅ Via keytar |

**Not a replacement for dotenv** → a **secure extension** for production apps.

---

## 📁 Examples

Check out the [example/](./example) folder for working demos:
- Basic usage
- Schema validation
- Multi-environment setup
- Encryption/decryption

---

## 🌐 Ecosystem

- **Vite Plugin:** [@ibnushahraa/vite-plugin-dotenv-guard](https://github.com/ibnushahraa/dotenv-guard/tree/main/packages/vite-plugin)

---

## Best Practices

- ✅ Store **encrypted `.env`** in git (with `enc: true`)
- ✅ Keep `env.schema.json` in git for validation
- ✅ Use `.env.local` for local overrides (gitignored)
- ✅ Never commit plaintext secrets
- ✅ Use `multiEnv: true` for Vite/multi-environment projects

---

## 📄 License

[MIT](../../LICENSE) © 2025
