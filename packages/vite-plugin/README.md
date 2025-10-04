# @ibnushahraa/vite-plugin-dotenv-guard

[![npm version](https://img.shields.io/npm/v/@ibnushahraa/vite-plugin-dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/vite-plugin-dotenv-guard)
[![npm downloads](https://img.shields.io/npm/dm/@ibnushahraa/vite-plugin-dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/vite-plugin-dotenv-guard)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

🔐 **Vite plugin for dotenv-guard** - load and validate environment variables with auto-mode detection.

---

## ✨ Features

- 🔄 **Auto Mode Detection** → Automatically loads `.env.{mode}` based on Vite mode
- 🔒 **Encryption Support** → Auto-decrypts encrypted values (AES-256-GCM)
- 🎯 **Selective Encryption** → Config-based encryption via `env.enc.json`
- ✅ **Schema Validation** → Enforce required keys, regex patterns, enums (same as core)
- ⚡ **Zero Config** → Works out of the box with Vite modes
- 🎯 **Type-Safe** → Full TypeScript support
- 📦 **Zero Native Deps** → Built-in crypto, no keytar required

---

## 📦 Installation

```bash
npm install @ibnushahraa/vite-plugin-dotenv-guard
```

---

## 🚀 Usage

### Basic Setup

```js
// vite.config.js
import { defineConfig } from 'vite';
import dotenvGuard from '@ibnushahraa/vite-plugin-dotenv-guard';

export default defineConfig({
  plugins: [
    dotenvGuard()
  ]
});
```

This automatically loads:
- `.env.development` → when running `npm run dev` (development mode)
- `.env.production` → when running `npm run build` (production mode)
- `.env.{custom}` → when running `vite --mode custom`

---

### With Schema Validation

Create `env.schema.json`:

```json
{
  "VITE_API_URL": {
    "required": true,
    "regex": "^https?://"
  },
  "VITE_API_KEY": {
    "required": true
  },
  "VITE_ENV": {
    "required": true,
    "enum": ["development", "staging", "production"]
  }
}
```

Enable validator:

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

If validation fails, **build/dev server will exit** with error details.

---

## ⚙️ Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `path` | `string` | `undefined` | Custom .env file path (auto-detects `.env.{mode}` if not set) |
| `validator` | `boolean` | `false` | Enable schema validation |
| `schema` | `string` | `'env.schema.json'` | Schema file path |

**Note:** Encryption is always enabled. Plugin auto-decrypts encrypted values at build-time (read-only, no file modification).

---

## 📚 Examples

### With Validation

```js
dotenvGuard({
  validator: true
})
```

**Note:**
- Encryption is always enabled (auto-decrypts encrypted values)
- Selective encryption is configured via CLI: `npx dotenv-guard init enc`
- To use plaintext .env, run: `npx dotenv-guard decrypt` first

### Custom Schema Path

```js
dotenvGuard({
  validator: true,
  schema: 'config/env.schema.json'
})
```

### Custom File Path

```js
dotenvGuard({
  path: '.env.custom',
  validator: true
})
```

### TypeScript

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import dotenvGuard from '@ibnushahraa/vite-plugin-dotenv-guard';

export default defineConfig({
  plugins: [
    dotenvGuard({
      validator: true,
      schema: 'env.schema.json'
    })
  ]
});
```

---

## 📋 Schema Validation Rules

Same format as core package:

```json
{
  "VARIABLE_NAME": {
    "required": true,        // Boolean (default: true)
    "regex": "^pattern$",    // String regex pattern
    "enum": ["val1", "val2"] // Array of allowed values
  }
}
```

**Example:**

```json
{
  "VITE_API_URL": {
    "required": true,
    "regex": "^https?://.*"
  },
  "VITE_LOG_LEVEL": {
    "required": false,
    "enum": ["debug", "info", "warn", "error"]
  }
}
```

---

## 🔄 Mode Detection

Plugin automatically detects Vite mode:

```bash
npm run dev              # Loads .env.development
npm run build            # Loads .env.production
vite --mode staging      # Loads .env.staging
```

---

## 🆚 Comparison

### ❌ Without Plugin

```js
// Manual dotenv loading
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export default defineConfig({
  // ... config
});
```

### ✅ With Plugin

```js
import dotenvGuard from '@ibnushahraa/vite-plugin-dotenv-guard';

export default defineConfig({
  plugins: [dotenvGuard({ validator: true })]
});
```

---

## 🛡️ Best Practices

- ✅ Use `VITE_` prefix for client-side variables
- ✅ Keep `.env.local` and `.env.*.local` in `.gitignore`
- ✅ Commit `.env.development` and `.env.production` templates
- ✅ Enable `validator: true` to catch missing variables early

---

## ⚠️ Important Notes

- **Auto-Decryption**: Always enabled, auto-decrypts encrypted values using AES-256-GCM (via core package)
- **Selective Encryption**: Configure via `npx dotenv-guard init enc` (creates `env.enc.json`)
- **Read-Only**: Plugin only decrypts at build-time, never modifies `.env` files
- **Master Key**: Encryption key stored in `~/.dotenv-guard/master.key` (auto-generated)
- **Vite-Only**: Designed specifically for Vite. For other build tools, use [@ibnushahraa/dotenv-guard](https://www.npmjs.com/package/@ibnushahraa/dotenv-guard)

---

## 📖 Related

- **Core Package:** [@ibnushahraa/dotenv-guard](https://github.com/ibnushahraa/dotenv-guard/tree/main/packages/core) (with encryption support)
- **Monorepo:** [dotenv-guard](https://github.com/ibnushahraa/dotenv-guard)

---

## 📄 License

[MIT](../../LICENSE) © 2025
