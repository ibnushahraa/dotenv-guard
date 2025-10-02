# Contributing to dotenv-guard

Thank you for your interest in contributing to `dotenv-guard`! We welcome contributions from the community.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Monorepo Structure](#monorepo-structure)
- [Coding Guidelines](#coding-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Publishing Packages](#publishing-packages)

---

## 📜 Code of Conduct

This project follows a Code of Conduct. By participating, you are expected to uphold this code:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When creating a bug report, include:**
- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Node.js version and OS
- Code sample or test case

**Example:**
```markdown
**Bug Description:**
Multi-env loading doesn't respect priority order

**Steps to Reproduce:**
1. Create `.env` with `DB_HOST=localhost`
2. Create `.env.local` with `DB_HOST=127.0.0.1`
3. Call `config({ multiEnv: true })`
4. Check `process.env.DB_HOST`

**Expected:** 127.0.0.1 (from .env.local)
**Actual:** localhost (from .env)

**Environment:**
- Node.js: v18.0.0
- OS: Ubuntu 22.04
- dotenv-guard: v1.2.0
```

### Suggesting Features

We love feature suggestions!

**When suggesting a feature, include:**
- Clear use case and problem it solves
- Proposed API (code examples)
- Alternative solutions you've considered
- Whether you're willing to implement it

### Improving Documentation

Documentation improvements are always welcome!

- Fix typos or clarify unclear sections
- Add more examples
- Improve API documentation
- Add examples for Vite plugin usage

---

## 🛠️ Development Setup

### Prerequisites

- Node.js >= 14.0.0
- npm >= 7.0.0 (for workspaces support)
- Git

### Setup Steps

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/dotenv-guard.git
   cd dotenv-guard
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run tests**
   ```bash
   npm test
   ```

5. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

---

## 📁 Monorepo Structure

This is a monorepo managed with npm workspaces:

```
dotenv-guard/
├── packages/
│   ├── core/                    # @ibnushahraa/dotenv-guard
│   │   ├── src/                 # Core implementation
│   │   ├── test/                # Core tests
│   │   ├── example/             # Usage examples
│   │   └── package.json
│   │
│   └── vite-plugin/             # @ibnushahraa/vite-plugin-dotenv-guard
│       ├── src/                 # Plugin implementation
│       ├── test/                # Plugin tests
│       └── package.json
│
├── package.json                 # Root workspace config
├── CHANGELOG.md                 # Version history
├── CONTRIBUTING.md              # This file
└── README.md                    # Monorepo documentation
```

### Working with Packages

```bash
# Test specific package
npm run test:core
npm run test:vite-plugin

# Work in a specific package
cd packages/core
npm test
```

---

## 📝 Coding Guidelines

### Style Guide

We follow standard JavaScript conventions:

**Variables & Functions:**
```js
// Use camelCase
const envConfig = { multiEnv: true };
function loadConfig() {}

// Use descriptive names
const schemaValidator = new Validator();  // Good
const v = new Validator();                // Bad
```

**Classes:**
```js
// Use PascalCase
class EnvValidator {}
class MultiEnvLoader {}
```

**Constants:**
```js
// Use UPPER_SNAKE_CASE for true constants
const DEFAULT_SCHEMA_PATH = 'env.schema.json';
const AES_ALGORITHM = 'aes-256-cbc';
```

**Private Methods:**
```js
// Prefix with underscore
_encryptValue() {}
_decryptValue() {}
```

### Code Quality

- **Keep it simple** - Favor readability over cleverness
- **Minimal dependencies** - Core library has minimal dependencies (deasync, keytar)
- **Document complex logic** - Add comments for non-obvious code
- **Error handling** - Use try-catch and provide helpful error messages

### JSDoc Comments

Add JSDoc comments for all public methods:

```js
/**
 * Load and validate environment variables
 * @param {Object} options - Configuration options
 * @param {boolean} [options.multiEnv=false] - Enable multi-environment loading
 * @param {boolean} [options.enc=true] - Enable encryption
 * @param {boolean} [options.validator=false] - Enable schema validation
 * @returns {void}
 */
function config(options) {
    // Implementation
}
```

---

## 🧪 Testing Guidelines

### Writing Tests

- Every feature must have tests
- Every bug fix must have a regression test
- Aim for high code coverage (>80%)

**Test Structure:**
```js
describe("Feature Name", () => {
    beforeEach(() => {
        // Setup
    });

    afterEach(() => {
        // Cleanup
    });

    it("should do something specific", () => {
        // Arrange
        const options = { multiEnv: true };

        // Act
        config(options);

        // Assert
        expect(process.env.DB_HOST).toBe('localhost');
    });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run core tests only
npm run test:core

# Run vite-plugin tests only
npm run test:vite-plugin
```

### Test Naming

Use descriptive test names:

```js
// Good
it("should return null when key doesn't exist", () => {});
it("should load .env.local after .env", () => {});
it("should validate against schema when validator enabled", () => {});

// Bad
it("works", () => {});
it("test config", () => {});
```

---

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Scopes

- `core` - Core package changes
- `vite-plugin` - Vite plugin changes
- `cli` - CLI changes
- `docs` - Documentation changes

### Examples

```bash
# Feature
git commit -m "feat(core): add mode-specific schema support"
git commit -m "feat(vite-plugin): add TypeScript definitions"

# Bug fix
git commit -m "fix(core): prevent memory leak in multi-env loading"
git commit -m "fix(vite-plugin): correct config hook parameter name"

# Documentation
git commit -m "docs: update README with monorepo structure"

# Test
git commit -m "test(core): add tests for schema validation"

# Refactor
git commit -m "refactor(core): simplify multi-env file loading"
```

---

## 🔄 Pull Request Process

### Before Submitting

1. ✅ **Tests pass** - `npm test` succeeds
2. ✅ **Code is formatted** - Follow style guide
3. ✅ **Documentation updated** - Update README if needed
4. ✅ **Commits follow guidelines** - Use conventional commits
5. ✅ **Branch is up to date** - Rebase on latest main

### PR Checklist

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Which Package?
- [ ] Core (@ibnushahraa/dotenv-guard)
- [ ] Vite Plugin (@ibnushahraa/vite-plugin-dotenv-guard)
- [ ] Both
- [ ] Documentation only

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated the documentation
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally
- [ ] I have updated CHANGELOG.md
```

### PR Title

Follow conventional commits format:

```
feat(core): add mode-specific schema support
fix(vite-plugin): correct config hook parameter
docs: improve multi-env documentation
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, PR will be merged
4. Your contribution will be included in the next release

---

## 📦 Publishing Packages

**Note:** Only maintainers can publish packages.

### Publishing Core Package

```bash
cd packages/core

# Update version in package.json
npm version patch  # or minor, major

# Publish to npm
npm publish

# Tag release
git tag -a v1.2.1 -m "Release v1.2.1"
git push origin v1.2.1
```

### Publishing Vite Plugin

```bash
cd packages/vite-plugin

# Update version
npm version patch

# Publish
npm publish
```

### Release Checklist

- [ ] All tests pass
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] GitHub release created
- [ ] npm package published

---

## 🎯 Priority Areas

We especially welcome contributions in these areas:

### High Priority
- [ ] More real-world examples
- [ ] Performance optimizations
- [ ] Better error messages
- [ ] Improved TypeScript definitions

### Medium Priority
- [ ] Additional validation rules
- [ ] More CLI templates
- [ ] Vite plugin example projects
- [ ] Integration guides (Express, NestJS, Nuxt, etc.)

### Documentation
- [ ] Video tutorials
- [ ] Blog posts
- [ ] Translation (internationalization)

---

## 📞 Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/ibnushahraa/dotenv-guard/discussions)
- **Bug reports?** Open an [Issue](https://github.com/ibnushahraa/dotenv-guard/issues)
- **Need help with PR?** Tag maintainers in your PR comments

---

## 🙏 Recognition

Contributors will be recognized in:
- CHANGELOG.md for their contributions
- README.md contributors section (coming soon)
- GitHub contributors page

---

## 📄 License

By contributing to `dotenv-guard`, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
