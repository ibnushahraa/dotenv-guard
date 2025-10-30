/**
 * Example: Multi-Environment Mode with dotenv-guard
 *
 * This example demonstrates how to use the `mode` parameter to automatically
 * load different .env files based on the environment.
 */

const { config } = require('../src/index.js');
const os = require('os');

console.log('=== Multi-Environment Mode Example ===\n');

// Example 1: Using DOTENV_GUARD_MODE environment variable
console.log('Example 1: Using DOTENV_GUARD_MODE');
console.log('--------------------------------------');
config({
  mode: process.env.DOTENV_GUARD_MODE || 'development'
});
console.log(`Mode: ${process.env.DOTENV_GUARD_MODE || 'development'}`);
console.log('Loaded environment variables from:');
console.log('  - .env (base)');
console.log('  - .env.local (if exists)');
console.log(`  - .env.${process.env.DOTENV_GUARD_MODE || 'development'} (if exists)`);
console.log(`  - .env.${process.env.DOTENV_GUARD_MODE || 'development'}.local (if exists)\n`);

// Example 2: Hostname-based mode selection
console.log('Example 2: Hostname-based mode selection');
console.log('--------------------------------------');
const hostname = os.hostname();
const mode = hostname === 'ubuntu' ? 'production' : 'development';
console.log(`Current hostname: ${hostname}`);
console.log(`Selected mode: ${mode}`);
console.log(`
Usage:
  config({
    mode: os.hostname() === 'ubuntu' ? 'production' : 'development'
  });
\n`);

// Example 3: HOSTNAME environment variable
console.log('Example 3: HOSTNAME environment variable');
console.log('--------------------------------------');
console.log(`HOSTNAME env var: ${process.env.HOSTNAME || 'not set'}`);
console.log(`
Usage:
  config({
    mode: process.env.HOSTNAME === 'production-server' ? 'production' : 'development'
  });
\n`);

// Example 4: With validation
console.log('Example 4: Multi-environment with validation');
console.log('--------------------------------------');
console.log(`
Usage:
  config({
    mode: process.env.DOTENV_GUARD_MODE || 'development',
    validator: true
  });

This will:
1. Load env files based on mode
2. Validate against env.schema.json (or env.schema.[mode].json if exists)
3. Exit with error if validation fails
\n`);

console.log('=== Setup Instructions ===\n');
console.log('1. Create your environment files:');
console.log('   .env                    # Base config (committed)');
console.log('   .env.local             # Local overrides (gitignored)');
console.log('   .env.development       # Development config (committed)');
console.log('   .env.production        # Production config (committed)');
console.log('');
console.log('2. Set DOTENV_GUARD_MODE environment variable:');
console.log('   export DOTENV_GUARD_MODE=production');
console.log('');
console.log('3. Or use hostname-based detection:');
console.log('   config({');
console.log('     mode: os.hostname() === "ubuntu" ? "production" : "development"');
console.log('   });');
console.log('');
console.log('4. Files are loaded in priority order (later overrides earlier):');
console.log('   .env → .env.local → .env.[mode] → .env.[mode].local');
