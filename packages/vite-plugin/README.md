# @ibnushahraa/vite-plugin-dotenv-guard

[![npm version](https://img.shields.io/npm/v/@ibnushahraa/vite-plugin-dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/vite-plugin-dotenv-guard)
[![npm downloads](https://img.shields.io/npm/dm/@ibnushahraa/vite-plugin-dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/vite-plugin-dotenv-guard)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

🔐 **Vite plugin for [dotenv-guard](https://github.com/ibnushahraa/dotenv-guard)** - secure environment variables with encryption, validation, and multi-environment support.

---

## ✨ Features

- 🔄 **Auto Multi-Environment** → `.env`, `.env.local`, `.env.[mode]`, `.env.[mode].local`
- ✅ **Schema Validation** → enforce required keys, regex patterns, enums
- 🔒 **Optional Encryption** → AES-256-CBC (disabled by default for Vite)
- ⚡ **Zero Config** → works out of the box with Vite modes
- 🎯 **Type-Safe** → full TypeScript support
- 🛡️ **Vite-Optimized** → respects `VITE_` prefix convention

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
- `.env` → base config
- `.env.local` → local overrides
- `.env.development` → dev mode (when running `vite`)
- `.env.production` → prod mode (when running `vite build`)

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

Full TypeScript definitions included!

---

## ⚙️ Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `multiEnv` | `boolean` | `true` | Enable multi-environment file loading |
| `enc` | `boolean` | `false` | Enable encryption (use `true` for encrypted .env) |
| `validator` | `boolean` | `false` | Enable schema validation |
| `schema` | `string` | `'env.schema.json'` | Schema file path |
| `path` | `string` | `undefined` | Single .env file path (disables multiEnv) |

---

## 📚 Examples

### Custom Schema Path

```js
dotenvGuard({
  validator: true,
  schema: 'config/env.schema.json'
})
```

### Single File Mode

```js
dotenvGuard({
  path: '.env.custom',
  validator: true
})
```

### With Encryption

```js
dotenvGuard({
  enc: true,          // Enable encryption
  validator: true
})
```

**Note:** Encrypted .env files must be decrypted first using the core package CLI:
```bash
npx dotenv-guard decrypt
```

---

## 🔄 Multi-Environment Loading

Files are loaded in this order (later files override earlier ones):

```
.env                    # Base config (committed)
.env.local              # Local overrides (gitignored)
.env.[mode]             # Mode-specific (e.g., .env.development)
.env.[mode].local       # Mode-specific local (gitignored)
```

**Vite modes:**
- `vite` → `development`
- `vite build` → `production`
- `vite --mode staging` → `staging`

---

## 🆚 vs Manual Config

**❌ Manual (old way):**
```js
import { config } from '@ibnushahraa/dotenv-guard';

config({
  multiEnv: true,
  mode: process.env.NODE_ENV || 'development',
  enc: false,
  validator: true
});

export default defineConfig({
  // ... config
});
```

**✅ Plugin (new way):**
```js
import dotenvGuard from '@ibnushabraa/vite-plugin-dotenv-guard';

export default defineConfig({
  plugins: [dotenvGuard({ validator: true })]
});
```

---

## 🛡️ Best Practices

- ✅ Use `VITE_` prefix for client-side variables
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Commit `.env` and `.env.production` (if not encrypted)
- ✅ Enable `validator: true` in production
- ✅ Use encryption (`enc: true`) for sensitive production configs

---

## 📖 Related

- **Core Package:** [@ibnushahraa/dotenv-guard](https://github.com/ibnushahraa/dotenv-guard/tree/main/packages/core)
- **Monorepo:** [dotenv-guard](https://github.com/ibnushahraa/dotenv-guard)

---

## 📄 License

[MIT](../../LICENSE) © 2025
