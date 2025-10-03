// Auto-encryption with zero config (like keytar, but no native deps)
const cryptoEncryption = require('./cryptoEncryption.js');
const keyManager = require('./keyManager.js');
const encryptionConfig = require('./encryptionConfig.js');

// Legacy keytar-based encryption (for backward compatibility)
let legacyEncryption = null;
try {
  legacyEncryption = require('./encryption.js');
} catch (err) {
  // Keytar not available, use crypto encryption only
}

// Export crypto-based encryption as default
module.exports = {
  // Core encryption functions (auto-generated key, zero config)
  encryptEnv: cryptoEncryption.encryptEnv,
  decryptEnv: cryptoEncryption.decryptEnv,
  loadEnv: cryptoEncryption.loadEnv,
  encryptValue: cryptoEncryption.encryptValue,
  decryptValue: cryptoEncryption.decryptValue,
  isEncrypted: cryptoEncryption.isEncrypted,
  isLegacyEncrypted: cryptoEncryption.isLegacyEncrypted,

  // Key management (internal, auto-handled)
  getOrCreateMasterKey: keyManager.getOrCreateMasterKey,
  masterKeyExists: keyManager.masterKeyExists,

  // Encryption config (selective encryption)
  loadEncryptionConfig: encryptionConfig.loadEncryptionConfig,
  generateEncryptionConfig: encryptionConfig.generateEncryptionConfig,
  saveEncryptionConfig: encryptionConfig.saveEncryptionConfig,

  // Config function (zero-config, auto-encrypt/decrypt)
  config: (options = {}) => {
    const file = options.path || '.env';

    // Always auto-decrypt (read-only, no file modification)
    cryptoEncryption.loadEnv(file);

    // Validation if requested
    if (options.validator) {
      const { loadSchema, validateEnv } = require('./encryption.js');
      const schema = loadSchema(options.schema || 'env.schema.json');
      if (schema) {
        validateEnv(process.env, schema);
      }
    }
  },

  // Legacy (backward compatibility, if keytar available)
  legacy: legacyEncryption
};
