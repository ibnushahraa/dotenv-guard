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

**Option 2: Core Package (Not Recommended)**

For Vite projects, **use the vite-plugin instead** (Option 1).

If you must use core package in vite.config.js:

```js
// vite.config.js (NOT RECOMMENDED - use vite-plugin instead)
import { config } from "@ibnushahraa/dotenv-guard";

// Load specific env file
config({
  path: '.env.development',  // Manual file selection
  enc: false,                // Decrypt to plaintext
  validator: true
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

## 🔑 Master Key Storage

The encryption master key is stored with automatic fallback for production-ready deployment:

### Storage Priority

1. **Environment Variable** (recommended for production)
   ```bash
   export DOTENV_GUARD_MASTER_KEY=your-64-char-hex-key
   ```
   - Best for CI/CD, Docker, Kubernetes
   - Works in serverless environments (AWS Lambda, etc.)
   - No filesystem dependency

2. **User Home Directory** (default for development)
   ```
   ~/.dotenv-guard/master.key
   ```
   - Auto-generated on first use
   - Persists across projects
   - Secure file permissions (0600)

3. **Project Directory** (fallback for restricted environments)
   ```
   ./.dotenv-guard/master.key
   ```
   - Used when home directory is not writable
   - Good for Docker containers without persistent home
   - **Remember to add to `.gitignore`**

4. **Temp Directory** (last resort)
   ```
   /tmp/.dotenv-guard/master.key
   ```
   - For serverless/lambda environments
   - Ephemeral, regenerated on each cold start

### Production Deployment

**Docker / Kubernetes:**
```dockerfile
ENV DOTENV_GUARD_MASTER_KEY=your-key-here
```

**AWS Lambda:**
```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --environment Variables={DOTENV_GUARD_MASTER_KEY=your-key}
```

**Vercel / Netlify:**
Add `DOTENV_GUARD_MASTER_KEY` in dashboard environment variables.

### Key Generation

Generate a master key manually:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📚 API Reference

### `config(options)`

Main function to load and validate environment variables.

```javascript
const { config } = require('@ibnushahraa/dotenv-guard');

config({
  path: '.env',              // .env file path (default: '.env')
  validator: false,         // Enable schema validation (default: false)
  schema: 'env.schema.json' // Schema file path (default: 'env.schema.json')
});

// After config(), all env vars are loaded to process.env
console.log(process.env.DB_HOST);
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `path` | `string` | `'.env'` | Path to .env file |
| `validator` | `boolean` | `false` | Enable schema validation |
| `schema` | `string` | `'env.schema.json'` | Schema file path |

**Note:** Encryption is always enabled. Plugin auto-decrypts encrypted values at runtime (read-only, no file modification).

**Common use cases:**

```javascript
// Basic usage (auto-decrypt encrypted values)
config();

// With validation
config({ validator: true });

// Different env file
config({ path: '.env.production' });

// With custom schema
config({ validator: true, schema: 'config/env.schema.json' });
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

- ✅ Store **encrypted `.env`** in git (with selective encryption via `env.enc.json`)
- ✅ Keep `env.schema.json` in git for validation
- ✅ Use `.env.local` for local overrides (gitignored)
- ✅ Never commit plaintext secrets
- ✅ Use `@ibnushahraa/vite-plugin-dotenv-guard` for Vite projects
- ✅ Use `npx dotenv-guard decrypt` to convert encrypted → plaintext (if needed)

---

## 📄 License

[MIT](../../LICENSE) © 2025
