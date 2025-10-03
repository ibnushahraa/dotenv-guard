# @ibnushahraa/nuxt-dotenv-guard

[![npm version](https://img.shields.io/npm/v/@ibnushahraa/nuxt-dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/nuxt-dotenv-guard)
[![npm downloads](https://img.shields.io/npm/dm/@ibnushahraa/nuxt-dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/nuxt-dotenv-guard)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

🔐 **Nuxt 3 module for dotenv-guard** - secure .env files with encryption and validation.

---

## ✨ Features

- 🔒 **Auto-Decryption** → Automatically decrypts encrypted .env values (AES-256-GCM)
- 🎯 **Auto Mode Detection** → Loads `.env.development` or `.env.production` based on dev mode
- ✅ **Schema Validation** → Validate environment variables with JSON schema
- 🔑 **Zero Config** → Works out of the box with sensible defaults
- 🌐 **Server & Client** → Server-side env vars + public runtime config for client
- 📦 **Zero Native Deps** → Pure Node.js crypto, no keytar required

---

## 📦 Installation

```bash
npm install @ibnushahraa/nuxt-dotenv-guard
```

---

## 🚀 Usage

### Basic Setup

```js
// nuxt.config.js
export default defineNuxtConfig({
  modules: ['@ibnushahraa/nuxt-dotenv-guard']
})
```

This automatically loads:
- `.env.development` → when running `npm run dev`
- `.env.production` → when running `npm run build`

---

### With Options

```js
// nuxt.config.js
export default defineNuxtConfig({
  modules: ['@ibnushahraa/nuxt-dotenv-guard'],

  dotenvGuard: {
    // path: '.env',              // Custom .env file path
    validator: true,              // Enable schema validation
    schema: 'env.schema.json'     // Schema file path
  }
})
```

---

## 📝 Environment Files

### `.env.development`

```env
# Server-side only (not exposed to client)
DB_HOST=localhost
DB_PASSWORD=secret123
API_SECRET=dev-secret-key

# Public (exposed to client with NUXT_PUBLIC_ prefix)
NUXT_PUBLIC_API_URL=http://localhost:3000/api
NUXT_PUBLIC_APP_NAME=My App
```

### `.env.production`

```env
DB_HOST=prod-db.example.com
DB_PASSWORD=aes:abc123:def456:ghi789  # Encrypted
API_SECRET=aes:xyz123:uvw456:rst789   # Encrypted

NUXT_PUBLIC_API_URL=https://api.production.com
NUXT_PUBLIC_APP_NAME=My Production App
```

---

## 🔐 Encryption

### Encrypt your .env files

```bash
# Generate selective encryption config
npx dotenv-guard init enc

# Edit env.enc.json to choose which keys to encrypt
# {
#   "encrypt": ["DB_PASSWORD", "API_SECRET"],
#   "plaintext": ["DB_HOST", "NUXT_PUBLIC_API_URL"]
# }

# Encrypt
npx dotenv-guard encrypt .env.production
```

The module will **automatically decrypt** encrypted values at build time.

---

## ✅ Schema Validation

### Create schema file

```json
// env.schema.json
{
  "DB_HOST": {
    "required": true
  },
  "DB_PASSWORD": {
    "required": true
  },
  "NUXT_PUBLIC_API_URL": {
    "required": true,
    "regex": "^https?://"
  }
}
```

### Enable validation

```js
// nuxt.config.js
export default defineNuxtConfig({
  modules: ['@ibnushahraa/nuxt-dotenv-guard'],

  dotenvGuard: {
    validator: true
  }
})
```

If validation fails, the build will exit with error details.

---

## 🌐 Server vs Client Variables

### Server-side only (default)

All environment variables are available server-side via `process.env`:

```js
// server/api/users.js
export default defineEventHandler((event) => {
  const dbHost = process.env.DB_HOST
  const dbPassword = process.env.DB_PASSWORD
  // ...
})
```

### Client-side (public variables)

Only variables with `NUXT_PUBLIC_` prefix are exposed to the client:

```vue
<script setup>
const config = useRuntimeConfig()

console.log(config.public.NUXT_PUBLIC_API_URL)  // ✅ Available
console.log(config.public.DB_PASSWORD)          // ❌ Undefined (secure)
</script>
```

---

## ⚙️ Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `path` | `string` | Auto-detected | Custom .env file path |
| `validator` | `boolean` | `false` | Enable schema validation |
| `schema` | `string` | `'env.schema.json'` | Schema file path |

---

## 🔧 CLI Commands

```bash
# Generate .env files from templates
npx dotenv-guard init

# Generate encryption config (selective)
npx dotenv-guard init enc

# Encrypt .env file
npx dotenv-guard encrypt .env.production

# Decrypt .env file
npx dotenv-guard decrypt .env.production

# Migrate from legacy format
npx dotenv-guard migrate
```

---

## 📚 Examples

### Different env files for different modes

```js
// nuxt.config.js
export default defineNuxtConfig({
  modules: ['@ibnushahraa/nuxt-dotenv-guard'],

  dotenvGuard: {
    path: process.env.NODE_ENV === 'staging'
      ? '.env.staging'
      : undefined  // Auto-detect
  }
})
```

---

## ⚠️ Important Notes

- **Auto-Decryption**: Always enabled, automatically decrypts `aes:*` values
- **Read-Only**: Module never modifies .env files
- **Master Key**: Stored in `~/.dotenv-guard/master.key` (auto-generated)
- **Nuxt 3 Only**: This module is designed for Nuxt 3+

---

## 🆚 Comparison with @nuxtjs/dotenv

| Feature | @nuxtjs/dotenv | @ibnushahraa/nuxt-dotenv-guard |
|---------|----------------|--------------------------------|
| Load .env files | ✅ | ✅ |
| Encryption | ❌ | ✅ AES-256-GCM |
| Selective encryption | ❌ | ✅ Config-based |
| Schema validation | ❌ | ✅ JSON schema |
| Auto mode detection | ❌ | ✅ dev/production |
| Nuxt 3 support | ❌ | ✅ |

---

## 📖 Related

- **Core Package:** [@ibnushahraa/dotenv-guard](https://github.com/ibnushahraa/dotenv-guard/tree/main/packages/core)
- **Vite Plugin:** [@ibnushahraa/vite-plugin-dotenv-guard](https://github.com/ibnushahraa/dotenv-guard/tree/main/packages/vite-plugin)
- **Monorepo:** [dotenv-guard](https://github.com/ibnushahraa/dotenv-guard)

---

## 📄 License

[MIT](../../LICENSE) © 2025
