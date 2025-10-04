// Example 3: Selective Encryption
const { config } = require('../src/index');

console.log('=== Example 3: Selective Encryption (via env.enc.json) ===');

// Selective encryption - only encrypt sensitive keys
// First, generate config: npx dotenv-guard init enc
// This creates env.enc.json with:
// {
//   "encrypt": ["DB_PASSWORD", "API_KEY", "SECRET_KEY"],
//   "plaintext": ["PORT", "NODE_ENV", "LOG_LEVEL"]
// }

config({
  validator: true
  // Encryption always enabled - auto-decrypts encrypted values
  // Selective encryption controlled by CLI (env.enc.json)
});

console.log('Environment variables loaded:');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[decrypted]' : 'not set');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

console.log('\nUseful commands:');
console.log('  npx dotenv-guard init enc         - Generate selective encryption config');
console.log('  npx dotenv-guard encrypt          - Encrypt keys (respects env.enc.json)');
console.log('  npx dotenv-guard decrypt          - Decrypt to plaintext');
console.log('  npx dotenv-guard migrate          - Migrate from legacy format');

console.log('\nEncryption details:');
console.log('  Method: AES-256-GCM (authenticated encryption)');
console.log('  Master key: ~/.dotenv-guard/master.key (auto-generated)');
console.log('  Format: aes:iv:authTag:encryptedData');
