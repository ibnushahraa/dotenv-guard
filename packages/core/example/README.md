# Examples

This directory contains examples of how to use `dotenv-guard` in different scenarios.

## Files

### Environment Files
- `.env` - Base environment variables (loaded in all environments)
- `.env.development` - Development-specific variables
- `.env.production` - Production-specific variables
- `env.schema.json` - Validation schema for environment variables

### Example Scripts
- `basic-usage.js` - Basic usage like dotenv (encryption always enabled)
- `with-validation.js` - Using schema validation
- `with-encryption.js` - Selective encryption example
- `vite-config.js` - Multi-environment setup (Node.js context, use vite-plugin for actual Vite)

## Running Examples

### 1. Basic Usage
```bash
node example/basic-usage.js
```

### 2. With Validation
```bash
node example/with-validation.js
```

### 3. Selective Encryption
```bash
# Generate selective encryption config
cd example
npx dotenv-guard init enc      # Creates env.enc.json

# Edit env.enc.json to customize which keys to encrypt:
# {
#   "encrypt": ["DB_PASSWORD", "API_KEY"],
#   "plaintext": ["PORT", "NODE_ENV"]
# }

npx dotenv-guard encrypt       # Encrypt only specified keys
node with-encryption.js        # Load and auto-decrypt

# To use plaintext .env:
npx dotenv-guard decrypt       # Convert encrypted → plaintext
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
