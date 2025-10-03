# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added - Core Package v1.3.0
- **Zero-Config Encryption**: AES-256-GCM encryption with auto-generated master key
  - No native dependencies required (no keytar build issues)
  - Master key auto-generated and stored in `~/.dotenv-guard/master.key`
  - Cross-platform support (Windows/macOS/Linux/Docker)
  - Can override via `DOTENV_GUARD_MASTER_KEY` environment variable
- **Selective Encryption**: Choose which keys to encrypt via `env.enc.json`
  - New CLI command: `npx dotenv-guard init enc` to generate config
  - Auto-detects sensitive patterns (PASSWORD, SECRET, KEY, TOKEN, etc.)
  - Auto-detects public patterns (PORT, NODE_ENV, VITE_*, etc.)
  - Config format: `{ encrypt: [...], plaintext: [...] }`
  - Encrypts all keys by default if no config exists
- **Legacy Migration Support**: Backward compatibility with keytar-encrypted files
  - Auto-detects legacy format (`iv:cipher`) vs new format (`aes:iv:tag:cipher`)
  - New CLI command: `npx dotenv-guard migrate` for automatic migration
  - Fallback to legacy decryption if keytar still installed
  - Clear error messages with migration instructions
- **New Format**: `aes:ivHex:authTagHex:encryptedHex` with authenticated encryption
  - GCM mode provides both encryption and authentication
  - 12-byte IV (GCM standard) instead of 16-byte
  - Auth tag prevents tampering

### Changed - Core Package v1.3.0
- **Encryption Method**: AES-256-CBC → AES-256-GCM (authenticated encryption)
- **Dependencies**: Moved `keytar` and `deasync` to `optionalDependencies`
  - No longer required for basic functionality
  - Only needed for legacy format migration
- **Key Storage**: System keychain → user home directory (`~/.dotenv-guard/master.key`)
  - Simpler, more portable, cross-platform compatible
  - No native module compilation required

### Changed - Vite Plugin v0.3.0
- **Encryption Support**: Re-enabled encryption via core package dependency
  - Uses new crypto-based encryption (no native deps)
  - Auto-decrypts encrypted values during build
  - New option: `encryption: true` (enabled by default)
  - New option: `encConfig: 'env.enc.json'` for selective encryption

### Added - Nuxt Module v0.1.0
- **New Package**: `@ibnushahraa/nuxt-dotenv-guard` - Nuxt 3 module integration
  - Auto mode detection (`.env.development` vs `.env.production`)
  - Auto-decryption of AES-256-GCM encrypted values
  - Schema validation support with JSON schema
  - Public runtime config for `NUXT_PUBLIC_*` prefixed variables
  - Server-side only vars by default (secure)
  - TypeScript definitions included
  - Zero-config setup with sensible defaults
  - 11 comprehensive test cases

### Fixed - Core Package v1.3.0
- **Validator Integration**: Fixed validator to use crypto encryption instead of legacy
  - Added `loadSchema` and `validateEnv` to `cryptoEncryption.js`
  - Exported validation functions from `index.js` and `index.mjs`
  - Updated tests to reflect synchronous `config()` function
  - All 109 tests passing across all packages

---

## [1.2.0] - 2025-10-03

### Changed
- **Project Structure**: Migrated to monorepo architecture with npm workspaces
  - Core package: `@ibnushahraa/dotenv-guard` (packages/core)
  - New Vite plugin: `@ibnushahraa/vite-plugin-dotenv-guard` (packages/vite-plugin)
  - Single GitHub repository with multiple NPM packages
  - Shared dependencies and unified testing
- **Templates**: Improved environment variable naming
  - `APP_ENV` → `NODE_ENV` (standard convention)
  - `DB_PASS` → `DB_PASSWORD` (clearer naming)
  - `MAIL_PASS` → `MAIL_PASSWORD`
  - Default DB port: 3306 (MySQL) → 5432 (PostgreSQL)
- **Vite Templates**: Security-first approach
  - Only public variables use `VITE_` prefix
  - Database credentials, secrets NOT prefixed (not exposed to client)
- **CLI**: Removed outdated environment options from custom init
- **Git Configuration**: Moved `.claude/` from `.gitignore` to `.git/info/exclude`

### Added
- **Multi-Environment Support**: Auto-load multiple `.env` files based on `NODE_ENV`
  - New `multiEnv` option in `config()` function
  - Priority loading: `.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local`
  - Mode-specific schema support: `env.schema.[mode].json`
- **Vite Plugin Package**: `@ibnushabraa/vite-plugin-dotenv-guard` (v0.1.0)
  - Seamless Vite integration with plugin API
  - Auto-detects mode from Vite (`development`, `production`, `staging`)
  - TypeScript support with full type definitions
  - Zero-config setup with sensible defaults
  - ~70 lines of wrapper code around core package
  - 14 test cases covering all functionality
- **Improved Templates**: Redesigned auto-generated templates for Node.js and Vite
  - Modern Node.js template with PostgreSQL (port 5432), JWT, LOG_LEVEL, CORS
  - Vite template with proper security: only safe vars use `VITE_` prefix
  - Backend secrets in Vite templates are NOT exposed to client
  - Removed unused environment types (staging, qa, preview)
- **Enhanced CLI Messages**: Better user guidance
  - Clear explanation of Vite template security model
  - Improved custom init flow with correct template options
- **Project Structure**:
  - Added `.github/workflows/test.yml` for CI/CD automation
  - Added `example/` folder with working examples and `.env` samples (now in packages/core/example)
  - Added `jest.config.js` for better test configuration
  - Added TypeScript definitions (`index.d.ts`)
- **Documentation**:
  - Updated root README with monorepo overview
  - Separate comprehensive READMEs for each package
  - Added workspace-specific documentation
  - Improved Quick Start guides for Node.js and Vite users
  - Added `example/README.md` with usage examples
  - Updated main README with multi-environment documentation
  - Better `.gitignore` handling for example files

### Fixed
- Package.json `bin` path: `./src/cli/index.cjs` → `./src/cli/index.js`
- Multi-env test cleanup issue on Windows (EBUSY error)
- Template test cases updated to match new structure

### Removed
- Empty `src/utils/` directory
- Unused environment templates (staging, qa, preview)

---

## [1.0.2] - 2025-10-01

### Fixed
- README documentation improvements
- Minor text fixes and formatting

---

## [1.0.1] - 2025-10-01

### Changed
- Package name update
- README documentation improvements

---

## [1.0.0] - 2025-10-01

### Added
- **Initial Release** 🎉
- Core encryption/decryption functionality using AES-256-CBC
- System keychain integration via `keytar` for secure key storage
- Schema validation with regex and enum support
- CLI tool for environment management:
  - `init` - Generate environment files from templates
  - `init custom` - Interactive custom env file creation
  - `init schema` - Generate validation schema from existing .env
  - `encrypt` - Encrypt .env file values
  - `decrypt` - Decrypt .env file values
- Template support for Node.js projects
- Template support for Vite projects
- Synchronous API via `deasync` for drop-in replacement of `dotenv`
- CommonJS and ESM module support
- Vite project auto-detection
- Schema-based validation with exit on failure
- Support for `.env` file formats with comments and empty lines

### Core Features
- 🔒 **AES-256-CBC Encryption**: Keep sensitive values encrypted at rest
- 🗝 **System Keychain**: Encryption key stored securely via OS keychain
- ✅ **Schema Validation**: Enforce required keys, regex patterns, and enums
- ⚡ **CLI Generator**: Auto-generate `.env.*` files for different environments
- 🔄 **Sync API**: Drop-in replacement for `dotenv.config()` (no `await` needed)

---

## Release Links

- [1.2.0](https://github.com/ibnushahraa/dotenv-guard/releases/tag/v1.2.0) - Latest (Monorepo + Vite Plugin)
- [1.0.2](https://github.com/ibnushahraa/dotenv-guard/releases/tag/v1.0.2)
- [1.0.1](https://github.com/ibnushahraa/dotenv-guard/releases/tag/v1.0.1)
- [1.0.0](https://github.com/ibnushahraa/dotenv-guard/releases/tag/v1.0.0) - First Release
