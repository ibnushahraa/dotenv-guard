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

---

## ✨ Features

- 🔒 **AES-256-GCM Encryption** → keep `.env` secrets safe with authenticated encryption
- 🔑 **Zero-Config Encryption** → auto-generated master key, no native dependencies
- 🎯 **Selective Encryption** → choose which keys to encrypt via `env.enc.json`
- ✅ **Schema Validation** → enforce required keys, regex patterns, enums
- ⚡ **CLI Generator** → auto-generate `.env.*` (Node or Vite)
- 🔄 **Sync API** → drop-in replacement for `dotenv.config()` (no `await`)
- 🌍 **Multi-Environment** → auto-load `.env.[mode]` based on NODE_ENV
- 🛡️ **Vite Security** → safe template with proper VITE_ prefix usage
- 📦 **Cross-Platform** → works everywhere (Windows/macOS/Linux/Docker)
- ♻️ **Backward Compatible** → auto-migration from legacy keytar format

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
