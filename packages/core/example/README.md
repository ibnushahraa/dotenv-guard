# Examples

This directory contains examples of how to use `dotenv-guard` in different scenarios.

## Files

### Environment Files
- `.env` - Base environment variables (loaded in all environments)
- `.env.development` - Development-specific variables
- `.env.production` - Production-specific variables
- `env.schema.json` - Validation schema for environment variables

### Example Scripts
- `basic-usage.js` - Basic usage like dotenv
- `with-validation.js` - Using schema validation
- `with-encryption.js` - Using encryption feature
- `vite-config.js` - Multi-environment setup for Vite projects

## Running Examples

### 1. Basic Usage
```bash
node example/basic-usage.js
```

### 2. With Validation
```bash
node example/with-validation.js
```

### 3. With Encryption
First encrypt the .env file:
```bash
cd example
npx dotenv-guard encrypt
node with-encryption.js
```

### 4. Multi-Environment (Vite)
```bash
NODE_ENV=development node example/vite-config.js
NODE_ENV=production node example/vite-config.js
```

## Testing Multi-Environment Loading

To see how different `.env` files are loaded based on `NODE_ENV`:

```bash
# Load .env + .env.development
NODE_ENV=development node -e "require('./example/basic-usage.js')"

# Load .env + .env.production
NODE_ENV=production node -e "require('./example/basic-usage.js')"
```

## File Loading Priority

When using `multiEnv: true`, files are loaded in this order (later files override earlier ones):

1. `.env` - Base config
2. `.env.local` - Local overrides (gitignored)
3. `.env.[mode]` - Environment-specific
4. `.env.[mode].local` - Local environment overrides (gitignored)
