// Auto-encryption with zero config (like keytar, but no native deps)
const cryptoEncryption = require('./cryptoEncryption.js');
const keyManager = require('./keyManager.js');
const encryptionConfig = require('./encryptionConfig.js');
const { getEnvFiles, getSchemaFile } = require('./multi-env.js');

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
    // Support mode parameter for multi-environment loading
    if (options.mode) {
      const envFiles = getEnvFiles(options.mode);

      // Load all env files in priority order
      envFiles.forEach(file => {
        try {
          cryptoEncryption.loadEnv(file);
        } catch (err) {
          // Skip missing files silently (already filtered by getEnvFiles)
        }
      });

      // Validation if requested
      if (options.validator) {
        const schemaFile = options.schema || getSchemaFile(options.mode) || 'env.schema.json';
        const schema = cryptoEncryption.loadSchema(schemaFile);
        if (schema) {
          cryptoEncryption.validateEnv(process.env, schema);
        }
      }
    } else {
      // Legacy single-file mode
      const file = options.path || '.env';

      // Always auto-decrypt (read-only, no file modification)
      cryptoEncryption.loadEnv(file);

      // Validation if requested
      if (options.validator) {
        const schema = cryptoEncryption.loadSchema(options.schema || 'env.schema.json');
        if (schema) {
          cryptoEncryption.validateEnv(process.env, schema);
        }
      }
    }
  },

  // Legacy (backward compatibility, lazy-loaded)
  get legacy() {
    try {
      return require('./encryption.js');
    } catch (err) {
      return null;
    }
  }
};
