// Example 3: With encryption
const { config } = require('../src/index');

console.log('=== Example 3: With Encryption ===');

// Load encrypted .env file
config({
  enc: true,
  validator: true
});

console.log('Encrypted environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

console.log('\nNote: Encryption key is stored securely in system keychain');
console.log('Use CLI to encrypt: npx dotenv-guard encrypt');
