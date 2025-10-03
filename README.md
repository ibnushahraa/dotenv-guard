# dotenv-guard

[![npm version](https://img.shields.io/npm/v/@ibnushahraa/dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/dotenv-guard)
[![npm downloads](https://img.shields.io/npm/dm/@ibnushahraa/dotenv-guard.svg?style=flat-square)](https://www.npmjs.com/package/@ibnushahraa/dotenv-guard)
[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![CI](https://github.com/ibnushahraa/dotenv-guard/actions/workflows/test.yml/badge.svg)](https://github.com/ibnushahraa/dotenv-guard/actions)

🔐 Secure & validate your `.env` files with **encryption**, **schema validation**, and **CLI tools**.
Think of it as **dotenv on steroids** — with guardrails for production-ready apps.

---

## 📦 Packages

This is a monorepo containing:

- **[@ibnushahraa/dotenv-guard](./packages/core)** - Core library with encryption, validation, and multi-env support
- **[@ibnushahraa/vite-plugin-dotenv-guard](./packages/vite-plugin)** - Vite plugin for seamless integration
- **[@ibnushahraa/nuxt-dotenv-guard](./packages/nuxt-module)** - Nuxt 3 module with auto mode detection

---

## ✨ What Makes It Different?

### 🔐 Security First
- **AES-256-GCM Encryption** with authenticated encryption
- **Zero-config** master key generation (no native dependencies!)
- **Selective encryption** - choose what to encrypt via `env.enc.json`
- Built-in **migration tools** from legacy formats

### ✅ Production Ready
- **Schema validation** with regex, enums, and required fields
- **Multi-framework** support (Node.js, Vite, Nuxt)
- **Auto mode detection** (development/production)
- **Cross-platform** - works on Windows/macOS/Linux/Docker

### 🚀 Developer Experience
- **CLI tools** for quick setup and management
- **Drop-in replacement** for dotenv (no breaking changes)
- **TypeScript** definitions included
- **109 tests** across all packages

---

## 🚀 Quick Start

### For Node.js / Express / NestJS

```bash
npm install @ibnushahraa/dotenv-guard
```

```js
import { config } from "@ibnushahraa/dotenv-guard";
config({ validator: true });
```

[**→ Full Core Documentation**](./packages/core)

---

### For Vite / Vue / React

```bash
npm install @ibnushahraa/vite-plugin-dotenv-guard
```

```js
// vite.config.js
import dotenvGuard from '@ibnushabraa/vite-plugin-dotenv-guard';

export default defineConfig({
  plugins: [dotenvGuard({ validator: true })]
});
```

[**→ Full Vite Plugin Documentation**](./packages/vite-plugin)

---

### For Nuxt 3

```bash
npm install @ibnushahraa/nuxt-dotenv-guard
```

```js
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@ibnushahraa/nuxt-dotenv-guard'],
  dotenvGuard: {
    validator: true
  }
});
```

[**→ Full Nuxt Module Documentation**](./packages/nuxt-module)

---

## 💡 Why dotenv-guard?

| Feature | dotenv | dotenv-guard |
|---------|--------|--------------|
| Load .env files | ✅ | ✅ |
| Encryption | ❌ | ✅ AES-256-GCM |
| Zero native deps | ✅ | ✅ Built-in crypto |
| Selective encryption | ❌ | ✅ Config-based |
| Schema validation | ❌ | ✅ Regex + Enum |
| Multi-environment | ❌ | ✅ Auto-load |
| CLI tools | ❌ | ✅ Full-featured |
| Vite plugin | ❌ | ✅ First-class |
| Cross-platform | ✅ | ✅ No build required |

**Not a replacement for dotenv** → a **secure extension** for production apps.

---

## 🧪 Development

This is a monorepo managed with npm workspaces.

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Test specific package
npm run test:core
npm run test:vite-plugin
```

---

## 📖 Documentation

- **[Core Package](./packages/core)** - Full API reference and usage examples
- **[Vite Plugin](./packages/vite-plugin)** - Vite-specific integration guide

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Ways to contribute:**
- Report bugs and suggest features
- Submit pull requests
- Improve documentation
- Develop plugins for Vite integration

---

## 📄 License

[MIT](LICENSE) © 2025
